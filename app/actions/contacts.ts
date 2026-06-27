"use server";
import { prisma } from "@/lib/prisma";
import { AppException } from "@/lib/errors";
import type { Prisma } from "@/generated/prisma/client";

export async function findContact(invite_token: string) {
  if (!invite_token) {
    throw new Error("TOKEN_IS_MISSING");
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        invite_token,
      },
    });

    if (!user) {
      throw new Error("USER IS NULL");
    }

    return {
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      invite_token: user.invite_token,
    };
  } catch (error) {
    console.error("Error", error);
    throw new Error("CONTACT_NOT_EXIST");
  }
}

export async function addContactRequest(
  requested_by_id: string,
  contacted_id: string,
) {
  const isConnectionExist = await prisma.connections.findFirst({
    where: {
      OR: [
        {
          requested_by_id: requested_by_id,
          user1Id: contacted_id,
        },
        {
          requested_by_id: contacted_id,
          user1Id: requested_by_id,
        },
      ],
    },
  });

  if (isConnectionExist)
    throw new AppException({
      code: "CONNECTION_ALREADY_EXISTS",
      message: `You can't add user with status ${isConnectionExist.status}!`,
    });

  try {
    const connection = await prisma.connections.create({
      data: {
        user1Id: contacted_id,
        user2Id: requested_by_id,
        requested_by_id: requested_by_id,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return connection;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllContacts(userId: string) {
  return prisma.connections.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function acceptContact(connectionId: string) {
  try {
    const connection = await prisma.connections.update({
      where: {
        id: connectionId,
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
    return connection;
  } catch (error) {
    console.error("Error", error);
  }
}

export async function deleteConnection(connectionId: string) {
  try {
    await prisma.connections.delete({
      where: {
        id: connectionId,
      },
    });
  } catch (error) {
    console.error("Error", error);
  }
}

export async function cancelConnection(connectionId: string) {
  try {
    const connection = await prisma.connections.findUnique({
      where: {
        id: connectionId,
      },
    });

    if (connection?.status !== "PENDING") {
      throw new Error("This action is not available!");
    }

    await prisma.connections.delete({
      where: {
        id: connectionId,
      },
    });
  } catch (error) {
    console.error("Error", error);
    throw new Error(`${error}`);
  }
}

export async function rejectConnection(connectionId: string) {
  try {
    const connection = await prisma.connections.findUnique({
      where: {
        id: connectionId,
      },
    });

    if (connection?.status !== "PENDING") {
      throw new Error("This action is not available!");
    }

    await prisma.connections.delete({
      where: {
        id: connectionId,
      },
    });
  } catch (error) {
    console.error("Error", error);
    throw new Error(`${error}`);
  }
}

export async function findContactsWithConnection(
  userId: string,
  query: string,
) {
  if (query === "") return await getAllContacts(userId);
  const words = query.trim().split(/\s+/);

  return prisma.connections.findMany({
    where: {
      OR: [
        {
          user1Id: userId,
          user2: {
            AND: words.map((word) => ({
              OR: [
                { name: { contains: word, mode: "insensitive" } },
                { lastname: { contains: word, mode: "insensitive" } },
                { email: { contains: word, mode: "insensitive" } },
              ],
            })),
          },
        },
        {
          user2Id: userId,
          user1: {
            AND: words.map((word) => ({
              OR: [
                { name: { contains: word, mode: "insensitive" } },
                { lastname: { contains: word, mode: "insensitive" } },
                { email: { contains: word, mode: "insensitive" } },
              ],
            })),
          },
        },
      ],
    },
    include: {
      user1: { select: { id: true, name: true, lastname: true, email: true } },
      user2: { select: { id: true, name: true, lastname: true, email: true } },
    },
  });
}

export async function filterContacts(userId: string, query: string) {
  let orderBy: Prisma.ConnectionsOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (query) {
    case "latest":
      orderBy = { createdAt: "desc" };
      break;

    case "newest":
      orderBy = { createdAt: "asc" };
      break;

    case "ascending":
      orderBy = {
        user1: {
          name: "desc",
        },
      };
      break;

    case "descending":
      orderBy = {
        user1: {
          name: "asc",
        },
      };
      break;
  }

  return await prisma.connections.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: true,
      user2: true,
    },
    orderBy,
  });
}

export async function findConnectionBetweenTwoUsers(
  firstUserId: string,
  secondUserId: string,
) {
  if (!firstUserId || !secondUserId) throw new Error("IDS ERROR");

  try {
    const connection = await prisma.connections.findFirst({
      where: {
        OR: [
          {
            user1Id: firstUserId,
            user2Id: secondUserId,
          },
          {
            user1Id: secondUserId,
            user2Id: firstUserId,
          },
        ],
      },
    });

    return connection;
  } catch (error) {
    console.error(error);
  }
}
