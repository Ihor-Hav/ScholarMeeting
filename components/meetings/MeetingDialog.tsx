"use client";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { schedulingWithId } from "@/schemas/scheduling.shared";
import { useState } from "react";
import type { ContactTypeProps } from "@/types/contact.types";

const MeetingCreationForm = dynamic(
  () => import("@/components/meetings/forms/MeetingCreationForm"),
  {
    loading: () => (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        Loading booking form...
      </div>
    ),
  },
);

type MeetingDialogProps = {
  scheduling: schedulingWithId;
  organizerId: string;
  contacts: ContactTypeProps[];
  defaultOpen?: boolean;
  showTrigger?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function MeetingDialog({
  organizerId,
  scheduling,
  contacts,
  defaultOpen = false,
  showTrigger = true,
  onOpenChange,
}: MeetingDialogProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <Button variant="outline" onClick={() => handleOpenChange(true)}>
          Book A Meeting
        </Button>
      ) : null}
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Meeting</DialogTitle>
          <DialogDescription>Create meeting.</DialogDescription>
        </DialogHeader>
        <MeetingCreationForm
          organizerId={organizerId}
          scheduling={scheduling}
          contacts={contacts}
          onClose={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
