"use server";

import { prisma } from "@/lib/prisma";
import type { MeetingFormValues } from "@/schemas/meeting.shared";
import { generateInviteToken } from "@/utils/generate_invite_token";
import { addMeetingToGoogleCalendar, createOnlineMeetingLink } from "@/lib/meeting-integrations";
import { sendMeetingInvitationEmail } from "@/lib/email";
import { assertValidSlotForAvailability } from "@/lib/availability-rules";
import { assertCanAccessEvent } from "@/lib/scheduling-access";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

function assertFutureMeeting(startDate: Date) {
  if (startDate <= new Date()) {
    throw new Error("MEETING_START_DATE_MUST_BE_IN_FUTURE");
  }
}

async function releaseMeetingSlot(meetingId: string) {
  await prisma.slot.updateMany({
    where: { meetingId },
    data: { status: "FREE" },
  });
}

export async function getMeetings(userId: string) {
  if (!userId) throw new Error("INVALID_USER_ID");

  try {
    const userMeetings = await prisma.meeting.findMany({
      orderBy: {
        startDate: "asc",
      },
      where: {
        OR: [
          {
            organizerId: userId,
          },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        organizerId: true,
        eventId: true,
        startDate: true,
        endDate: true,
        status: true,
        meetingType: true,
        location: true,
        meetingLink: true,
        inviteToken: true,
        createdAt: true,
        updatedAt: true,
        event: {
          select: {
            id: true,
            hostId: true,
            duration: true,
            meetingMembers: true,
          },
        },
        participants: {
          select: {
            id: true,
            userId: true,
            meetingId: true,
            status: true,
          },
        },
      },
    });

    return userMeetings;
  } catch (e) {
    throw new Error(`${e}`);
  }
}

export async function createMeeting(
  data: MeetingFormValues,
  organizerId: string,
  eventOwnerId: string,
  eventId: string,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== organizerId) {
    throw new Error("MEETING_CREATE_UNAUTHORIZED");
  }

  await assertCanAccessEvent(eventId, organizerId);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organization: true },
  });

  if (!event) {
    throw new Error("EVENT_NOT_FOUND");
  }

  if (event.organizationId) {
    const memberships = await prisma.organizationMember.findMany({
      where: {
        organizationId: event.organizationId,
        userId: { in: [organizerId, eventOwnerId] },
      },
    });

    const organizerMembership = memberships.find(
      (membership: { userId: string; role: string }) =>
        membership.userId === organizerId,
    );
    const hostMembership = memberships.find(
      (membership: { userId: string; role: string }) =>
        membership.userId === eventOwnerId,
    );

    if (!organizerMembership || !hostMembership) {
      throw new Error("ORGANIZATION_MEMBERSHIP_REQUIRED");
    }

    if (event.requiredHostRole) {
      const hostSatisfiesRequiredRole =
        event.requiredHostRole === "TEACHER"
          ? ["OWNER", "TEACHER"].includes(hostMembership.role)
          : hostMembership.role === event.requiredHostRole;

      if (!hostSatisfiesRequiredRole) {
        throw new Error("EVENT_HOST_ROLE_MISMATCH");
      }
    }

    if (
      event.requiredGuestRole &&
      organizerMembership.role !== event.requiredGuestRole
    ) {
      throw new Error("ORGANIZATION_GUEST_ROLE_MISMATCH");
    }
  }

  const invitedParticipantIds = Array.from(new Set(data.participants || []))
    .filter((participantId) => participantId !== organizerId)
    .filter((participantId) => participantId !== eventOwnerId);

  if (event.meetingMembers === "ONE_ON_ONE" && invitedParticipantIds.length > 0) {
    throw new Error("ONE_ON_ONE_MEETINGS_CANNOT_HAVE_EXTRA_PARTICIPANTS");
  }

  if (
    !["GROUP", "ORGANIZATION"].includes(event.meetingMembers) &&
    invitedParticipantIds.length > 0
  ) {
    throw new Error("EXTRA_PARTICIPANTS_ALLOWED_ONLY_FOR_GROUP_MEETINGS");
  }

  if (event.meetingMembers === "ORGANIZATION" && invitedParticipantIds.length > 0) {
    if (!event.organizationId) throw new Error("ORGANIZATION_ID_REQUIRED");

    const organizationInviteCount = await prisma.organizationMember.count({
      where: {
        organizationId: event.organizationId,
        userId: { in: invitedParticipantIds },
      },
    });

    if (organizationInviteCount !== invitedParticipantIds.length) {
      throw new Error("INVITED_USER_IS_NOT_ORGANIZATION_MEMBER");
    }
  }

  const maxMembers = event.max_members || 2;
  const totalParticipantCount = 1 + invitedParticipantIds.length;

  if (event.meetingMembers === "GROUP" && totalParticipantCount > maxMembers) {
    throw new Error("MEETING_MAX_MEMBERS_EXCEEDED");
  }

  if (!data.slot?.startDate || !data.slot?.availabilityId) {
    throw new Error("INVALID_SLOT");
  }

  const availabilityId = data.slot.availabilityId;
  const startDate = new Date(data.slot.startDate);
  const endDate = data.slot.endDate
    ? new Date(data.slot.endDate)
    : new Date(startDate.getTime() + data.duration * 60 * 1000);

  assertFutureMeeting(startDate);

  const availability = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });

  if (!availability) {
    throw new Error("AVAILABILITY_NOT_FOUND");
  }

  if (availability.userId !== eventOwnerId) {
    throw new Error("SLOT_AVAILABILITY_OWNER_MISMATCH");
  }

  assertValidSlotForAvailability({
    availability,
    startDate,
    endDate,
    durationMinutes: data.duration,
  });

  const overlappingBookedSlot = await prisma.slot.findFirst({
    where: {
      availability: { userId: eventOwnerId },
      status: "BOOKED",
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  if (overlappingBookedSlot) {
    throw new Error("SLOT_ALREADY_BOOKED");
  }

  const meetingLink = await createOnlineMeetingLink({
    meetingType: data.meetingType,
    organizerId,
    title: data.title,
    description: data.description,
    startDate,
    endDate,
  });
  const inviteToken = generateInviteToken();

  try {
    const meeting = await prisma.$transaction(async (tx) => {
      const conflictingSlot = await tx.slot.findFirst({
        where: {
          availability: { userId: eventOwnerId },
          status: "BOOKED",
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });

      if (conflictingSlot) throw new Error("SLOT_ALREADY_BOOKED");

      return tx.meeting.create({
        data: {
          title: data.title,
          description: data.description || "",

          startDate,
          endDate,

          organizerId,
          eventId,
          meetingType: data.meetingType,
          location:
            data.meetingType === "IN_PERSON"
              ? data.location || event.location
              : null,
          meetingLink,

          inviteToken,

          slot: {
            create: {
              availabilityId,
              startDate,
              endDate,
              status: "BOOKED",
            },
          },

          participants: {
            create: [
              {
                userId: eventOwnerId,
                roleSnapshot: event.requiredHostRole,
              },
              ...invitedParticipantIds.map((participantId) => ({
                userId: participantId,
              })),
            ],
          },

          comments: data.comment?.trim()
            ? {
                create: {
                  authorId: organizerId,
                  body: data.comment.trim(),
                },
              }
            : undefined,
        },
        include: { organizer: true, participants: { include: { user: true } } },
      });
    }, {
      isolationLevel: "Serializable",
    });

    if (data.addToGoogleCalendar) {
      await addMeetingToGoogleCalendar({
        userId: organizerId,
        title: data.title,
        description: data.description,
        startDate,
        endDate,
        meetingLink,
      });
    }

    await Promise.allSettled(
      meeting.participants
        .filter((participant) => participant.user.email)
        .map((participant) =>
          sendMeetingInvitationEmail({
            to: participant.user.email,
            title: meeting.title,
            inviterName: `${meeting.organizer.name} ${meeting.organizer.lastname}`.trim(),
            startDate: meeting.startDate,
            meetingLink: meeting.meetingLink,
          }),
        ),
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function updateMeeting(
  meetingId: string,
  userId: string,
  data: Partial<Pick<MeetingFormValues, "title" | "description" | "location" | "participants">>,
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      event: true,
      organizer: true,
      participants: { select: { userId: true } },
    },
  });

  if (!meeting) throw new Error("MEETING_NOT_FOUND");
  if (meeting.organizerId !== userId) throw new Error("MEETING_UPDATE_FORBIDDEN");

  const invitedParticipantIds = Array.from(new Set(data.participants || []))
    .filter((participantId) => participantId !== userId)
    .filter(
      (participantId) =>
        !meeting.participants.some(
          (participant) => participant.userId === participantId,
        ),
    );

  const updatedMeeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      ...(data.participants
        ? {
            participants: {
              create: invitedParticipantIds.map((participantId) => ({ userId: participantId })),
            },
          }
        : {}),
    },
  });

  if (invitedParticipantIds.length > 0) {
    const invitedUsers = await prisma.user.findMany({
      where: { id: { in: invitedParticipantIds } },
      select: { email: true },
    });

    await Promise.allSettled(
      invitedUsers.map((user) =>
        sendMeetingInvitationEmail({
          to: user.email,
          title: updatedMeeting.title,
          inviterName: `${meeting.organizer.name} ${meeting.organizer.lastname}`.trim(),
          startDate: updatedMeeting.startDate,
          meetingLink: updatedMeeting.meetingLink,
        }),
      ),
    );
  }

  return updatedMeeting;
}

export async function updateMeetingParticipationStatus(
  meetingId: string,
  userId: string,
  status: "ACCEPTED" | "DECLINED" | "CANCELLED",
) {
  if (!meetingId) throw new Error("INVALID_MEETING_ID");
  if (!userId) throw new Error("INVALID_USER_ID");

  try {
    return await prisma.meetingParticipant.update({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
      data: { status },
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function cancelMeeting(meetingId: string, userId: string) {
  if (!meetingId) throw new Error("INVALID_MEETING_ID");
  if (!userId) throw new Error("INVALID_USER_ID");

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      event: true,
      participants: true,
    },
  });

  if (!meeting) throw new Error("MEETING_NOT_FOUND");
  if (meeting.status === "CANCELLED") return meeting;

  const isOrganizer = meeting.organizerId === userId;
  const participant = meeting.participants.find(
    (item: { userId: string }) => item.userId === userId,
  );

  if (!isOrganizer && !participant) {
    throw new Error("MEETING_ACCESS_DENIED");
  }

  if (isOrganizer || meeting.event.meetingMembers === "ONE_ON_ONE") {
    const cancelled = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: "CANCELLED",
        participants: {
          updateMany: {
            where: {},
            data: { status: "CANCELLED" },
          },
        },
      },
    });

    await releaseMeetingSlot(meetingId);

    return cancelled;
  }

  return await prisma.meetingParticipant.update({
    where: {
      meetingId_userId: {
        meetingId,
        userId,
      },
    },
    data: { status: "CANCELLED" },
  });
}

export async function rescheduleMeeting(
  meetingId: string,
  userId: string,
  slot: NonNullable<MeetingFormValues["slot"]>,
) {
  if (!meetingId) throw new Error("INVALID_MEETING_ID");
  if (!userId) throw new Error("INVALID_USER_ID");
  if (!slot?.startDate || !slot?.availabilityId) throw new Error("INVALID_SLOT");

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      event: true,
      participants: true,
    },
  });

  if (!meeting) throw new Error("MEETING_NOT_FOUND");
  if (meeting.status === "CANCELLED") throw new Error("MEETING_CANCELLED");

  const isOrganizer = meeting.organizerId === userId;
  const isParticipant = meeting.participants.some(
    (item: { userId: string }) => item.userId === userId,
  );

  if (!isOrganizer && !isParticipant) {
    throw new Error("MEETING_ACCESS_DENIED");
  }

  if (!isOrganizer && meeting.event.meetingMembers !== "ONE_ON_ONE") {
    throw new Error("ONLY_HOST_CAN_RESCHEDULE_GROUP_OR_ORGANIZATION_MEETINGS");
  }

  const startDate = new Date(slot.startDate);
  const endDate = slot.endDate
    ? new Date(slot.endDate)
    : new Date(startDate.getTime() + meeting.event.duration * 60 * 1000);

  assertFutureMeeting(startDate);

  const availability = await prisma.availability.findUnique({
    where: { id: slot.availabilityId },
  });

  if (!availability) throw new Error("AVAILABILITY_NOT_FOUND");
  if (availability.userId !== meeting.event.hostId) {
    throw new Error("SLOT_AVAILABILITY_OWNER_MISMATCH");
  }

  assertValidSlotForAvailability({
    availability,
    startDate,
    endDate,
    durationMinutes: meeting.event.duration,
  });

  const overlappingBookedSlot = await prisma.slot.findFirst({
    where: {
      availability: { userId: meeting.event.hostId },
      status: "BOOKED",
      meetingId: { not: meetingId },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  if (overlappingBookedSlot) {
    throw new Error("SLOT_ALREADY_BOOKED");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.slot.updateMany({
      where: { meetingId },
      data: {
        availabilityId: slot.availabilityId,
        startDate,
        endDate,
        status: "BOOKED",
      },
    });

    return tx.meeting.update({
      where: { id: meetingId },
      data: {
        startDate,
        endDate,
        participants: {
          updateMany: {
            where: { status: "CANCELLED" },
            data: { status: "PENDING" },
          },
        },
      },
    });
  });
}
