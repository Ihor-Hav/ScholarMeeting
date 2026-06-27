"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addMeetingComment } from "@/app/actions/meeting-mutations";
import MeetingCard from "@/components/meetings/MeetingCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MeetingWithFullOrganizer } from "@/schemas/meeting.shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MeetingDetailDialogProps = {
  meeting: MeetingWithFullOrganizer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
};

export default function MeetingDetailDialog({
  meeting,
  open,
  onOpenChange,
  currentUserId,
}: MeetingDetailDialogProps) {
  const [commentBody, setCommentBody] = useState("");
  const [addedComments, setAddedComments] = useState<
    Record<string, MeetingWithFullOrganizer["comments"]>
  >({});
  const [isPending, startTransition] = useTransition();
  const comments = meeting
    ? [...meeting.comments, ...(addedComments[meeting.id] || [])]
    : [];

  const submitComment = () => {
    if (!meeting || !commentBody.trim()) return;

    startTransition(async () => {
      try {
        const comment = await addMeetingComment(meeting.id, commentBody);
        setAddedComments((current) => ({
          ...current,
          [meeting.id]: [...(current[meeting.id] || []), comment],
        }));
        setCommentBody("");
      } catch {
        toast.error("Could not add comment");
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setCommentBody("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[105vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Meeting details</DialogTitle>
          <DialogDescription>
            Review the selected meeting from your calendar.
          </DialogDescription>
        </DialogHeader>

        {meeting ? (
          <>
            <MeetingCard
              title={meeting.title}
              description={meeting.description || ""}
              meetingType={meeting.meetingType}
              startDate={new Date(meeting.startDate)}
              endDate={new Date(meeting.endDate)}
              location={meeting.location || ""}
              meetingLink={meeting.meetingLink}
              participantsCount={meeting.participants.length + 1}
              isOrganizer={meeting.organizerId === currentUserId}
              meetingStatus={meeting.status}
              meetingUrl={meeting.meetingLink}
            />

            <div className="grid gap-2 md:grid-cols-2">
              <section className="space-y-3">
                <h3 className="font-semibold">Participants</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <span>
                      {meeting.organizer.name} {meeting.organizer.lastname}
                    </span>
                    <Badge>Organizer</Badge>
                  </div>
                  {meeting.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <span>
                        {participant.user.name} {participant.user.lastname}
                      </span>
                      <Badge variant="outline">{participant.status}</Badge>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold">Comments</h3>
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-md border p-3">
                        <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                          <span>
                            {comment.author.name} {comment.author.lastname}
                          </span>
                          <span>
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm">
                          {comment.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <Textarea
                  value={commentBody}
                  maxLength={2000}
                  placeholder="Leave a comment..."
                  onChange={(event) => setCommentBody(event.target.value)}
                />
                <Button
                  type="button"
                  disabled={isPending || !commentBody.trim()}
                  onClick={submitComment}
                >
                  {isPending ? "Sending..." : "Add comment"}
                </Button>
              </section>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Meeting not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
