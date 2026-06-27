"use server";

import { prisma } from "@/lib/prisma";
import type { SlotType } from "@/schemas/meeting.shared";
import { assertValidSlotForAvailability } from "@/lib/availability-rules";
import { sendMeetingRescheduledEmail } from "@/lib/email";
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

export async function addMeetingComment(meetingId: string, body: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const normalizedBody = body.trim();
  if (!normalizedBody || normalizedBody.length > 2000) {
    throw new Error("INVALID_MEETING_COMMENT");
  }

  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      OR: [
        { organizerId: session.user.id },
        { participants: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true },
  });

  if (!meeting) throw new Error("MEETING_ACCESS_DENIED");

  return prisma.meetingComment.create({
    data: {
      meetingId,
      authorId: session.user.id,
      body: normalizedBody,
    },
    select: {
      id: true,
      body: true,
      authorId: true,
      createdAt: true,
      author: {
        select: { id: true, name: true, lastname: true },
      },
    },
  });
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
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function cancelMeeting(meetingId: string, userId: string) {
  if (!meetingId) throw new Error("INVALID_MEETING_ID");
  if (!userId) throw new Error("INVALID_USER_ID");

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      event: true,
      organizer: { select: { id: true, email: true } },
      participants: {
        include: { user: { select: { id: true, email: true } } },
      },
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
  slot: SlotType,
) {
  if (!meetingId) throw new Error("INVALID_MEETING_ID");
  if (!userId) throw new Error("INVALID_USER_ID");
  if (!slot?.startDate || !slot?.availabilityId) throw new Error("INVALID_SLOT");

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      event: true,
      organizer: { select: { id: true, email: true } },
      participants: {
        include: { user: { select: { id: true, email: true } } },
      },
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

  const updatedMeeting = await prisma.$transaction(
    async (tx) => {
      const conflictingSlot = await tx.slot.findFirst({
        where: {
          availability: { userId: meeting.event.hostId },
          status: "BOOKED",
          meetingId: { not: meetingId },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });

      if (conflictingSlot) throw new Error("SLOT_ALREADY_BOOKED");

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
    },
    { isolationLevel: "Serializable" },
  );

  const recipients = new Map<string, string>();
  if (meeting.organizer.email) {
    recipients.set(meeting.organizer.id, meeting.organizer.email);
  }
  for (const participant of meeting.participants) {
    if (participant.user.email) {
      recipients.set(participant.user.id, participant.user.email);
    }
  }
  recipients.delete(userId);

  await Promise.allSettled(
    [...recipients.values()].map((email) =>
      sendMeetingRescheduledEmail({
        to: email,
        title: meeting.title,
        startDate,
        endDate,
        meetingLink: meeting.meetingLink,
      }),
    ),
  );

  return updatedMeeting;
}
