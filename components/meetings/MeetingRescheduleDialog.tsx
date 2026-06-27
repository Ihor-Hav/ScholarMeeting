"use client";

import dynamic from "next/dynamic";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MeetingRescheduleForm = dynamic(
  () => import("@/components/meetings/forms/MeetingRescheduleForm"),
  {
    loading: () => (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        Loading reschedule form...
      </div>
    ),
  },
);

type MeetingRescheduleDialogProps = {
  meetingId: string;
  userId: string;
  availabilityOwnerId: string;
  duration: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MeetingRescheduleDialog({
  meetingId,
  userId,
  availabilityOwnerId,
  duration,
  open,
  onOpenChange,
}: MeetingRescheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reschedule meeting</DialogTitle>
          <DialogDescription>
            Choose a new date and available time slot.
          </DialogDescription>
        </DialogHeader>

        <MeetingRescheduleForm
          meetingId={meetingId}
          userId={userId}
          availabilityOwnerId={availabilityOwnerId}
          duration={duration}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
