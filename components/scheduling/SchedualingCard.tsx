"use client";

import Image from "next/image";

import type { schedulingWithId } from "@/schemas/scheduling.shared";
import { Button } from "@/components/ui/button";
import { WEEK_DAYS } from "@/components/scheduling/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  MapPin,
  CalendarDays,
  Building2,
  UserRound,
} from "lucide-react";
import { formatEnumLabel } from "@/lib/utils";

type SchedualingCardProps = {
  item: schedulingWithId;
  canManage?: boolean;
  onEdit: (item: schedulingWithId) => void;
  onDelete: (itemId: string) => void;
  onBook: (item: schedulingWithId) => void;
  onManageAccess?: (item: schedulingWithId) => void;
};

const MEETING_TYPE_META = {
  GOOGLE_MEET: {
    label: "Google Meet",
    icon: (
      <Image src="/google-meet.svg" alt="Google Meet" width={14} height={14} />
    ),
  },
  ZOOM: {
    label: "Zoom",
    icon: <Image src="/zoom.svg" alt="Zoom" width={14} height={14} />,
  },
  IN_PERSON: {
    label: "In Person",
    icon: <UserRound className="h-3.5 w-3.5" />,
  },
} as const;

export default function SchedulingCard({
  item,
  canManage = true,
  onEdit,
  onDelete,
  onBook,
  onManageAccess,
}: SchedualingCardProps) {
  const meetingType =
    MEETING_TYPE_META[item.MeetingType as keyof typeof MEETING_TYPE_META];

  const uniqueDays = [...new Set(item.week_days)];

  return (
    <Card className="group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5">
                {meetingType?.icon}
                {meetingType?.label ?? formatEnumLabel(item.MeetingType)}
              </Badge>

              {item.organization && (
                <Badge variant="outline" className="gap-1.5">
                  <Building2 className="h-3 w-3" />
                  {item.organization.name}
                </Badge>
              )}
            </div>

            <div>
              <CardTitle className="text-lg leading-tight">
                {item.title}
              </CardTitle>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{item.duration} min</span>

                <span>•</span>

                <span>{formatEnumLabel(item.MeetingMembers)}</span>

                {item.max_members && (
                  <>
                    <span>•</span>
                    <span>
                      Up to {item.max_members} participant
                      {item.max_members > 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            </div>

            <CardDescription className="line-clamp-2">
              {item.description ?? "No description provided"}
            </CardDescription>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    Edit
                  </DropdownMenuItem>

                  {item.bookingVisibility === "PRIVATE" && onManageAccess ? (
                    <DropdownMenuItem onClick={() => onManageAccess(item)}>
                      Manage access
                    </DropdownMenuItem>
                  ) : null}

                  <DropdownMenuItem
                    onClick={() => onDelete(item.id)}
                    className="text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {uniqueDays.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueDays.map((day) => (
              <Badge key={day} variant="outline" className="font-normal">
                <CalendarDays className="mr-1 h-3 w-3" />
                {WEEK_DAYS[day]}
              </Badge>
            ))}
          </div>
        )}

        {item.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{item.location}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button variant="outline" onClick={() => onBook(item)}>
          Book A Meeting
        </Button>
      </CardFooter>
    </Card>
  );
}
