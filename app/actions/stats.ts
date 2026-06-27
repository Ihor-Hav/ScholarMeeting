"use server";

import { prisma } from "@/lib/prisma";

export async function getHomeStats(userId: string) {
  if (!userId) throw new Error("INVALID_USER_ID");

  const now = new Date();
  const [upcomingMeetings, hostedEvents, contacts, connectedPlugins] = await Promise.all([
    prisma.meeting.count({
      where: {
        startDate: { gte: now },
        OR: [{ organizerId: userId }, { participants: { some: { userId } } }],
      },
    }),
    prisma.event.count({ where: { hostId: userId } }),
    prisma.connections.count({
      where: { status: "ACCEPTED", OR: [{ user1Id: userId }, { user2Id: userId }] },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccount: { select: { id: true } }, zoomAccount: { select: { id: true } } },
    }),
  ]);

  return {
    upcomingMeetings,
    hostedEvents,
    contacts,
    connectedPlugins: Number(Boolean(connectedPlugins?.googleAccount)) + Number(Boolean(connectedPlugins?.zoomAccount)),
  };
}
