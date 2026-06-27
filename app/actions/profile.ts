"use server";

import { prisma } from "@/lib/prisma";

export async function updateProfile(
  userId: string,
  name?: string,
  lastname?: string,
) {
  if (!userId) throw new Error("USER_ID_MISSING");

  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
        lastname: lastname,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("updateProfile error: ", error);

    throw new Error("PROFILE_UPDATE_ERROR");
  }
}

export async function findUserById(userId: string) {
  if (!userId) throw new Error("ID IS INVALID");

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch (e) {
    console.error(e);
    throw new Error("FIND_USER_ERROR");
  }
}
