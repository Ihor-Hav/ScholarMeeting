"use server";
import { prisma } from "@/lib/prisma";
import type {
  schedulingType,
  schedulingWithId,
  updateSchedulingType,
} from "@/schemas/scheduling.shared";
import { generateInviteToken } from "@/utils/generate_invite_token";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

function normalizeOrganizationFields(
  input: schedulingType | updateSchedulingType,
) {
  const isOrganizationMeeting = input.MeetingMembers === "ORGANIZATION";

  return {
    organizationId: input.organizationId || null,
    requiredHostRole: isOrganizationMeeting
      ? "TEACHER"
      : input.requiredHostRole || null,
    requiredGuestRole: isOrganizationMeeting
      ? "STUDENT"
      : input.requiredGuestRole || null,
  } as const;
}

async function assertTeacherCanCreateOrganizationScheduling(
  userId: string,
  organizationId?: string | null,
) {
  if (!organizationId) return;

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership || !["OWNER", "TEACHER"].includes(membership.role)) {
    throw new Error("ONLY_ORGANIZATION_TEACHERS_CAN_CREATE_SCHEDULING");
  }
}

export async function createSchedualing(
  input_data: schedulingType,
  userId: string,
) {
  if (!userId) throw new Error("User id was not found!");

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("Couldn't find user");

  const organizationFields = normalizeOrganizationFields(input_data);
  await assertTeacherCanCreateOrganizationScheduling(
    user.id,
    organizationFields.organizationId,
  );

  try {
    const schedualeEvent = await prisma.event.create({
      data: {
        title: input_data.title,
        description: input_data.description,
        week_days: input_data.week_days,
        duration: input_data.duration,
        meetingMembers: input_data.MeetingMembers,
        meetingType: input_data.MeetingType,
        max_members: input_data?.max_members,
        location: input_data?.location,
        bookingVisibility: input_data.bookingVisibility,
        hostId: user.id,
        invite_token: generateInviteToken(),
        ...organizationFields,
      },
    });

    return schedualeEvent;
  } catch (error) {
    console.error(error);
    throw new Error("Coulnd't create schedualing");
  }
}

export async function getSchedualings(
  userId: string,
): Promise<schedulingWithId[]> {
  try {
    const data = await prisma.event.findMany({
      where: {
        hostId: userId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return data.map((event) => ({
      ...event,
      MeetingType: event.meetingType,
      MeetingMembers: event.meetingMembers,
    }));
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't find any data");
  }
}

export async function getBookableOrganizationSchedualings(
  userId: string,
): Promise<schedulingWithId[]> {
  if (!userId) throw new Error("INVALID_USER_ID");

  try {
    const data = await prisma.event.findMany({
      where: {
        hostId: { not: userId },
        organizationId: { not: null },
        bookingVisibility: "ORGANIZATION",
        organization: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return data.map((event) => ({
      ...event,
      MeetingType: event.meetingType,
      MeetingMembers: event.meetingMembers,
    }));
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't find organization schedulings");
  }
}

export async function updateSchedualById(
  data: updateSchedulingType,
  id: string,
) {
  if (!id) throw new Error("Invalid user id");

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new Error("SCHEDULING_NOT_FOUND");

  const organizationFields = normalizeOrganizationFields(data);
  await assertTeacherCanCreateOrganizationScheduling(
    existing.hostId,
    organizationFields.organizationId,
  );

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        week_days: data.week_days,
        duration: data.duration,
        meetingMembers: data.MeetingMembers,
        meetingType: data.MeetingType,
        max_members: data.max_members,
        location: data.location,
        bookingVisibility: data.bookingVisibility,
        ...organizationFields,
      },
    });

    return updated;
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't find any data");
  }
}

export async function deleteSchedulingById(id: string) {
  if (!id) throw new Error("Invalid user id");

  try {
    const updated = await prisma.event.delete({
      where: { id },
    });

    return updated;
  } catch (error) {
    console.error(error);
    throw new Error("Couldn't find any data");
  }
}

async function getOwnedPrivateSchedule(eventId: string, userId: string) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      hostId: userId,
      bookingVisibility: "PRIVATE",
    },
    select: { id: true, hostId: true },
  });

  if (!event) throw new Error("PRIVATE_SCHEDULING_ACCESS_DENIED");
  return event;
}

export async function getPrivateScheduleAccess(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  await getOwnedPrivateSchedule(eventId, session.user.id);

  const grants = await prisma.privateScheduleAccess.findMany({
    where: { eventId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return grants.map((grant) => grant.user);
}

export async function setPrivateScheduleAccess(
  eventId: string,
  userIds: string[],
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const event = await getOwnedPrivateSchedule(eventId, session.user.id);
  const uniqueUserIds = [...new Set(userIds)].filter(
    (userId) => userId && userId !== session.user.id,
  );

  const existingUsers = await prisma.user.findMany({
    where: { id: { in: uniqueUserIds } },
    select: { id: true },
  });

  if (existingUsers.length !== uniqueUserIds.length) {
    throw new Error("PRIVATE_ACCESS_USER_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    await tx.privateScheduleAccess.deleteMany({ where: { eventId } });

    if (uniqueUserIds.length > 0) {
      await tx.privateScheduleAccess.createMany({
        data: uniqueUserIds.map((userId) => ({ eventId, userId })),
        skipDuplicates: true,
      });
    }
  });

  revalidatePath("/scheduling");
  revalidatePath(`/profile/${event.hostId}`);

  return uniqueUserIds;
}
