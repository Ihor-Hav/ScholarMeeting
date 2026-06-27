import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/getServerSession";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Zoom OAuth is not configured" }, { status: 500 });
  }

  const url = new URL("https://zoom.us/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  const state = crypto.randomUUID();
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  response.cookies.set("zoom_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });
  return response;
}
