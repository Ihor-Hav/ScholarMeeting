"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Check, Eye, RotateCcw, X } from "lucide-react";
import type { Session } from "next-auth";

import {
  cancelMeeting,
  updateMeetingParticipationStatus,
} from "@/app/actions/meeting-mutations";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { MeetingWithFullOrganizer } from "@/schemas/meeting.shared";
import MeetingCard from "./MeetingCard";
import MeetingRescheduleDialog from "./MeetingRescheduleDialog";
import MeetingDetailDialog from "./MeetingDetailDialog";

type MeetingWrapperProps = {
  session: Session;
  meetings: MeetingWithFullOrganizer[];
};

type MeetingStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
type ParticipationUpdateStatus = "ACCEPTED" | "DECLINED";
type UpdatingAction = {
  meetingId: string;
  status: ParticipationUpdateStatus;
} | null;
type MeetingBuckets = {
  activeMeetings: MeetingWithFullOrganizer[];
  pendingMeetings: MeetingWithFullOrganizer[];
  pastMeetings: MeetingWithFullOrganizer[];
  cancelledMeetings: MeetingWithFullOrganizer[];
};

function getParticipantStatus(
  meeting: MeetingWithFullOrganizer,
  userId: string,
): MeetingStatus | undefined {
  return meeting.participants.find(
    (participant: { userId: string; status: MeetingStatus }) =>
      participant.userId === userId,
  )?.status;
}

function EmptyMeetings({ message }: { message: string }) {
  return (
    <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default function MeetingWrapper({
  session,
  meetings,
}: MeetingWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingAction, setUpdatingAction] = useState<UpdatingAction>(null);
  const [cancellingMeetingId, setCancellingMeetingId] = useState<string | null>(
    null,
  );
  const [reschedulingMeeting, setReschedulingMeeting] =
    useState<MeetingWithFullOrganizer | null>(null);
  const [detailMeeting, setDetailMeeting] =
    useState<MeetingWithFullOrganizer | null>(null);
  const userId = session.user.id;

  const { activeMeetings, pendingMeetings, pastMeetings, cancelledMeetings } =
    useMemo<MeetingBuckets>(() => {
      const now = new Date().getTime();

      return meetings.reduce<MeetingBuckets>(
        (buckets, meeting) => {
          const participantStatus = getParticipantStatus(meeting, userId);
          const isOrganizer = meeting.organizerId === userId;
          const isPast = meeting.endDate.getTime() < now;

          if (meeting.status === "SCHEDULED" && isPast) {
            buckets.pastMeetings.push(meeting);
            return buckets;
          }

          if (
            meeting.status === "SCHEDULED" &&
            (isOrganizer || participantStatus === "ACCEPTED")
          ) {
            buckets.activeMeetings.push(meeting);
          }

          if (
            meeting.status === "SCHEDULED" &&
            !isOrganizer &&
            participantStatus === "PENDING"
          ) {
            buckets.pendingMeetings.push(meeting);
          }

          if (
            meeting.status === "CANCELLED" ||
            (!isOrganizer &&
              (participantStatus === "DECLINED" ||
                participantStatus === "CANCELLED"))
          ) {
            buckets.cancelledMeetings.push(meeting);
          }

          return buckets;
        },
        {
          activeMeetings: [],
          pendingMeetings: [],
          pastMeetings: [],
          cancelledMeetings: [],
        },
      );
    }, [meetings, userId]);

  const updateParticipation = useCallback((
    meetingId: string,
    status: ParticipationUpdateStatus,
  ) => {
    setUpdatingAction({ meetingId, status });

    startTransition(async () => {
      try {
        await updateMeetingParticipationStatus(meetingId, userId, status);
        router.refresh();
      } finally {
        setUpdatingAction(null);
      }
    });
  }, [router, startTransition, userId]);

  const isUpdating = useCallback(
    (meetingId: string, status: ParticipationUpdateStatus) =>
      isPending &&
      updatingAction?.meetingId === meetingId &&
      updatingAction.status === status,
    [isPending, updatingAction],
  );

  const cancelSelectedMeeting = useCallback((meetingId: string) => {
    setCancellingMeetingId(meetingId);

    startTransition(async () => {
      try {
        await cancelMeeting(meetingId, userId);
        router.refresh();
      } finally {
        setCancellingMeetingId(null);
      }
    });
  }, [router, startTransition, userId]);

  const renderMeetings = (
    visibleMeetings: MeetingWithFullOrganizer[],
    emptyMessage: string,
    options: { showPendingActions?: boolean; showActiveActions?: boolean } = {},
  ) => {
    if (visibleMeetings.length === 0) {
      return <EmptyMeetings message={emptyMessage} />;
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleMeetings.map((meeting) => {
          const participantStatus = getParticipantStatus(meeting, userId);
          const isOrganizer = meeting.organizerId === userId;
          const canReschedule =
            meeting.status === "SCHEDULED" &&
            (isOrganizer || meeting.event.meetingMembers === "ONE_ON_ONE");
          const canCancelParticipation =
            !isOrganizer &&
            (participantStatus === "PENDING" ||
              participantStatus === "ACCEPTED");
          const canCancelMeeting =
            meeting.status === "SCHEDULED" &&
            (isOrganizer || canCancelParticipation);
          const showApproveButton =
            options.showPendingActions && participantStatus === "PENDING";
          const showCancelButton =
            (options.showPendingActions || options.showActiveActions) &&
            canCancelMeeting;
          const showRescheduleButton =
            options.showActiveActions && canReschedule;
          const cancelLabel = isOrganizer
            ? "Cancel meeting"
            : participantStatus === "PENDING"
              ? "Decline"
              : "Leave meeting";

          return (
            <MeetingCard
              key={meeting.id}
              title={meeting.title}
              description={meeting.description || ""}
              meetingType={meeting.meetingType}
              startDate={meeting.startDate}
              endDate={meeting.endDate}
              location={meeting.location || ""}
              participantsCount={meeting.participants.length + 1}
              isOrganizer={isOrganizer}
              meetingStatus={meeting.status}
              participantStatus={participantStatus}
              meetingUrl={meeting.meetingLink}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDetailMeeting(meeting)}
              >
                <Eye className="size-4" />
                Details
              </Button>

              {showApproveButton && (
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => updateParticipation(meeting.id, "ACCEPTED")}
                >
                  <Check className="size-4" />
                  {isUpdating(meeting.id, "ACCEPTED")
                    ? "Accepting..."
                    : "Accept"}
                </Button>
              )}

              {showRescheduleButton && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setReschedulingMeeting(meeting)}
                >
                  <RotateCcw className="size-4" />
                  Reschedule
                </Button>
              )}

              {showCancelButton && (
                <Button
                  size="sm"
                  disabled={isPending}
                  variant="destructive"
                  onClick={() => cancelSelectedMeeting(meeting.id)}
                >
                  <X className="size-4" />
                  {cancellingMeetingId === meeting.id
                    ? "Cancelling..."
                    : cancelLabel}
                </Button>
              )}
            </MeetingCard>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b px-4 py-6">
        <h2 className="text-2xl font-semibold tracking-tight">Meetings</h2>
      </div>

      {meetings.length === 0 ? (
        <div className="px-4">
          <EmptyMeetings message="No meetings found" />
        </div>
      ) : (
        <Tabs defaultValue="active" className="px-4">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Not approved ({pendingMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledMeetings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {renderMeetings(activeMeetings, "No active meetings found", {
              showActiveActions: true,
            })}
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            {renderMeetings(
              pendingMeetings,
              "No meetings are waiting for your approval",
              { showPendingActions: true },
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            {renderMeetings(pastMeetings, "No past meetings found")}
          </TabsContent>
          <TabsContent value="cancelled" className="mt-4">
            {renderMeetings(cancelledMeetings, "No cancelled meetings found")}
          </TabsContent>
        </Tabs>
      )}

      {reschedulingMeeting && (
        <MeetingRescheduleDialog
          meetingId={reschedulingMeeting.id}
          userId={userId}
          availabilityOwnerId={reschedulingMeeting.event.hostId}
          duration={reschedulingMeeting.event.duration}
          open={!!reschedulingMeeting}
          onOpenChange={(open) => {
            if (!open) setReschedulingMeeting(null);
          }}
        />
      )}

      <MeetingDetailDialog
        meeting={detailMeeting}
        open={!!detailMeeting}
        onOpenChange={(open) => {
          if (!open) setDetailMeeting(null);
        }}
        currentUserId={userId}
      />
    </div>
  );
}
