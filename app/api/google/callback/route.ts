import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/getServerSession";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);
  params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET!);
  params.append("redirect_uri", process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!);
  params.append("grant_type", "authorization_code");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json() as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.expires_in) {
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 400 },
    );
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresIn = data.expires_in;

  await prisma.googleAccount.upsert({
    where: { userId },
    update: {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    },
    create: {
      userId,
      accessToken,
      refreshToken,
      isCalendarConnected: true,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    },
  });

  return NextResponse.redirect(new URL("/plugins?connected=google", req.url));
}
