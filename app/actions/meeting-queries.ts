"use server";

import { prisma } from "@/lib/prisma";
import type { MeetingWithFullOrganizer } from "@/schemas/meeting.shared";

export async function getMeetings(
  userId: string,
): Promise<MeetingWithFullOrganizer[]> {
  if (!userId) throw new Error("INVALID_USER_ID");

  try {
    return await prisma.meeting.findMany({
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
        organizer: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
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
            user: {
              select: {
                id: true,
                name: true,
                lastname: true,
                email: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            body: true,
            authorId: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                lastname: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`${error}`);
  }
}
