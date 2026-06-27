"use server";

import { withAction } from "@/lib/with-action";
import { SignUpFormSchema } from "@/schemas/auth.zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AppException } from "@/lib/errors";
import { generateInviteToken } from "@/utils/generate_invite_token";

export async function signUp(input: unknown) {
  return withAction(async () => {
    const data = SignUpFormSchema.parse(input);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppException({
        code: "USER_ALREADY_EXISTS",
        message: "User with this email already exists",
        fields: { email: ["Email is already taken"] },
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        lastname: data.lastname,
        password: hashedPassword,
        invite_token: generateInviteToken(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
    };
  });
}
