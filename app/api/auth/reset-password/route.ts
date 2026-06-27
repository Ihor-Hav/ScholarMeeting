import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const body = await req.json();
  const { password, confirmPassword, token } = body;

  if (!token || !password || !confirmPassword)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  if (password !== confirmPassword)
    return NextResponse.json(
      { error: "Password aren't matched" },
      { status: 400 },
    );

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gte: new Date() },
    },
    include: { user: true },
  });

  if (!record)
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: "Password updated successfully" });
}
