import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import type { MeetingType } from "@/generated/prisma/client";

export async function createOnlineMeetingLink(input: {
  meetingType: MeetingType;
  organizerId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}) {
  if (input.meetingType === "ZOOM") return createZoomMeeting(input);
  if (input.meetingType === "GOOGLE_MEET") return createGoogleMeet(input);
  return undefined;
}

async function createZoomMeeting(input: {
  organizerId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}) {
  const zoomAccount = await prisma.zoomAccount.findUnique({ where: { userId: input.organizerId } });
  if (!zoomAccount) throw new Error("ZOOM_NOT_CONNECTED");

  const duration = Math.max(1, Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / 60000));
  const requestMeeting = (accessToken: string) =>
    fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: input.title,
        agenda: input.description,
        type: 2,
        start_time: input.startDate.toISOString(),
        duration,
        settings: { join_before_host: true },
      }),
    });

  let response = await requestMeeting(zoomAccount.accessToken);
  if (response.status === 401 && zoomAccount.refreshToken) {
    const accessToken = await refreshZoomAccessToken(
      zoomAccount.id,
      zoomAccount.refreshToken,
    );
    response = await requestMeeting(accessToken);
  }

  const data = await response.json() as {
    join_url?: string;
    message?: string;
    code?: number;
  };

  if (!response.ok || !data.join_url) {
    console.error("Zoom meeting creation failed", response.status, data.code, data.message);
    throw new Error("ZOOM_MEETING_CREATION_FAILED");
  }

  return data.join_url;
}

async function refreshZoomAccessToken(accountId: string, refreshToken: string) {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("ZOOM_NOT_CONFIGURED");

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await response.json() as {
    access_token?: string;
    refresh_token?: string;
    reason?: string;
  };

  if (!response.ok || !data.access_token) {
    console.error("Zoom token refresh failed", response.status, data.reason);
    throw new Error("ZOOM_RECONNECT_REQUIRED");
  }

  await prisma.zoomAccount.update({
    where: { id: accountId },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
    },
  });

  return data.access_token;
}

async function createGoogleMeet(input: {
  organizerId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}) {
  const googleAccount = await prisma.googleAccount.findUnique({ where: { userId: input.organizerId } });
  if (!googleAccount) return undefined;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
  );
  auth.setCredentials({ access_token: googleAccount.accessToken, refresh_token: googleAccount.refreshToken });

  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.title,
      description: input.description,
      start: { dateTime: input.startDate.toISOString() },
      end: { dateTime: input.endDate.toISOString() },
      conferenceData: {
        createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
      },
    },
  });

  return response.data.hangoutLink || response.data.conferenceData?.entryPoints?.find((entry) => entry.uri)?.uri;
}

export async function addMeetingToGoogleCalendar(input: {
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  meetingLink?: string | null;
}) {
  const googleAccount = await prisma.googleAccount.findUnique({ where: { userId: input.userId } });
  if (!googleAccount) return;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
  );
  auth.setCredentials({ access_token: googleAccount.accessToken, refresh_token: googleAccount.refreshToken });

  await google.calendar({ version: "v3", auth }).events.insert({
    calendarId: "primary",
    requestBody: {
      summary: input.title,
      description: [input.description, input.meetingLink].filter(Boolean).join("\n\n"),
      start: { dateTime: input.startDate.toISOString() },
      end: { dateTime: input.endDate.toISOString() },
    },
  });
}
