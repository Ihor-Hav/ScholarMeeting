import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/getServerSession";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const searchParams = new URL(req.url).searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = req.cookies.get("zoom_oauth_state")?.value;

  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Zoom OAuth is not configured" }, { status: 500 });
  }

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });
  const data = await response.json() as {
    access_token?: string;
    refresh_token?: string;
    reason?: string;
  };
  if (!response.ok || !data.access_token) {
    console.error("Zoom token exchange failed", response.status, data.reason);
    return NextResponse.json({ error: "Token exchange failed" }, { status: 400 });
  }

  await prisma.zoomAccount.upsert({
    where: { userId: session.user.id },
    update: { accessToken: data.access_token, refreshToken: data.refresh_token },
    create: { userId: session.user.id, accessToken: data.access_token, refreshToken: data.refresh_token },
  });

  const redirect = NextResponse.redirect(new URL("/plugins?connected=zoom", req.url));
  redirect.cookies.delete("zoom_oauth_state");
  return redirect;
}
