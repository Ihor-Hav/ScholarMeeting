"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dynamic from "next/dynamic";

import type { EventClickArg, EventInput } from "@fullcalendar/core";
import { useMemo, useState } from "react";

import type { MeetingWithFullOrganizer } from "@/schemas/meeting.shared";

const MeetingDetailDialog = dynamic(
  () => import("@/components/meetings/MeetingDetailDialog"),
  {
    loading: () => null,
  },
);

interface CalendarProps {
  meetings?: MeetingWithFullOrganizer[];
  currentUserId?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  meetings = [],
  currentUserId,
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    null,
  );
  const [open, setOpen] = useState(false);

  const events = useMemo<EventInput[]>(
    () =>
      meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        start: new Date(meeting.startDate),
        end: new Date(meeting.endDate),
      })),
    [meetings],
  );

  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedMeetingId) || null,
    [meetings, selectedMeetingId],
  );

  const handleEventClick = (info: EventClickArg) => {
    setSelectedMeetingId(info.event.id);
    setOpen(true);
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        editable={false}
        events={events}
        eventClick={handleEventClick}
        eventClassNames="cursor-pointer"
      />

      <MeetingDetailDialog
        meeting={selectedMeeting}
        open={open}
        onOpenChange={setOpen}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default Calendar;
