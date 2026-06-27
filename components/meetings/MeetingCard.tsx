"use client";

import { memo, ReactNode, useMemo } from "react";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MeetingCardProps = {
  title: string;
  description?: string;
  meetingType: "GOOGLE_MEET" | "ZOOM" | "IN_PERSON";
  startDate: Date;
  endDate: Date;
  location?: string;
  meetingLink?: string | null;
  meetingUrl?: string | null;
  participantsCount?: number;
  isOrganizer?: boolean;
  meetingStatus?: "SCHEDULED" | "CANCELLED";
  participantStatus?: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  children?: ReactNode;
};

function formatMeetingType(type: MeetingCardProps["meetingType"]) {
  if (type === "GOOGLE_MEET") return "Google Meet";
  if (type === "ZOOM") return "Zoom";
  return "In Person";
}

function MeetingCard({
  title,
  description,
  meetingType,
  startDate,
  endDate,
  location,
  meetingLink,
  meetingUrl,
  participantsCount = 0,
  isOrganizer = false,
  meetingStatus = "SCHEDULED",
  participantStatus,
  children,
}: MeetingCardProps) {
  const onlineMeetingLink = meetingLink ?? meetingUrl;
  const canJoin =
    meetingStatus !== "CANCELLED" &&
    meetingType !== "IN_PERSON" &&
    Boolean(onlineMeetingLink);
  const meetingDate = useMemo(
    () =>
      startDate.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "long",
      }),
    [startDate],
  );
  const meetingTime = useMemo(
    () =>
      `${startDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    [endDate, startDate],
  );

  return (
    <Card className="rounded-2xl border shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">{title}</h3>

              {meetingStatus === "CANCELLED" && (
                <Badge variant="outline">Cancelled</Badge>
              )}

              {participantStatus && !isOrganizer && (
                <Badge
                  variant={
                    participantStatus === "ACCEPTED" ? "secondary" : "outline"
                  }
                >
                  {participantStatus.toLowerCase()}
                </Badge>
              )}
            </div>

            {description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            <span>{meetingDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 className="size-4" />
            <span>{meetingTime}</span>
          </div>

          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="size-4" />
            <span>
              {participantsCount} participant
              {participantsCount !== 1 && "s"}
            </span>
          </div>
        </div>

        {canJoin || children ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
            {canJoin && (
              <Button asChild size="sm">
                <a
                  href={onlineMeetingLink ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Video className="size-4" />
                  Join meeting
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            )}

            {children}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default memo(MeetingCard);
