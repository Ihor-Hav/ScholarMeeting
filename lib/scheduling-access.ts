import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getEventAccessWhere(
  viewerId: string | undefined,
  hostId: string,
): Promise<Prisma.EventWhereInput> {
  if (viewerId === hostId) return { hostId };

  const accessRules: Prisma.EventWhereInput[] = [
    { bookingVisibility: "PUBLIC" },
  ];

  if (viewerId) {
    const isAcceptedContact = await prisma.connections.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { user1Id: hostId, user2Id: viewerId },
          { user1Id: viewerId, user2Id: hostId },
        ],
      },
      select: { id: true },
    });

    if (isAcceptedContact) {
      accessRules.push({ bookingVisibility: "CONTACTS" });
    }

    accessRules.push(
      {
        bookingVisibility: "ORGANIZATION",
        organization: {
          members: {
            some: { userId: viewerId },
          },
        },
      },
      {
        bookingVisibility: "PRIVATE",
        privateAccessGrants: {
          some: { userId: viewerId },
        },
      },
    );
  }

  return {
    hostId,
    OR: accessRules,
  };
}

export async function assertCanAccessEvent(
  eventId: string,
  viewerId: string,
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { hostId: true },
  });

  if (!event) throw new Error("EVENT_NOT_FOUND");

  const accessibleEvent = await prisma.event.findFirst({
    where: {
      id: eventId,
      ...(await getEventAccessWhere(viewerId, event.hostId)),
    },
    select: { id: true },
  });

  if (!accessibleEvent) throw new Error("EVENT_ACCESS_DENIED");
}
