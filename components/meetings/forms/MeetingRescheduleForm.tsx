"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { rescheduleMeeting } from "@/app/actions/meeting-mutations";
import CalendarField from "@/components/meetings/fields/CalendarField";
import SlotField from "@/components/meetings/fields/SlotField";
import { Button } from "@/components/ui/button";
import { formatDateKey } from "@/lib/utils";
import { slotSchema } from "@/schemas/meeting.zod";
import type { SlotType } from "@/schemas/meeting.shared";

const rescheduleSchema = z.object({
  date: z.date(),
  slot: slotSchema.refine((slot) => !!slot.startDate, {
    message: "Please select a time slot",
  }),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

type MeetingRescheduleFormProps = {
  meetingId: string;
  userId: string;
  availabilityOwnerId: string;
  duration: number;
  onClose: () => void;
};

export default function MeetingRescheduleForm({
  meetingId,
  userId,
  availabilityOwnerId,
  duration,
  onClose,
}: MeetingRescheduleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<RescheduleFormValues>({
    defaultValues: {
      date: new Date(),
      slot: {},
    },
    resolver: zodResolver(rescheduleSchema),
  });
  const date = useWatch({ control: form.control, name: "date" });

  const handleSubmit = (values: RescheduleFormValues) => {
    startTransition(async () => {
      try {
        await rescheduleMeeting(meetingId, userId, values.slot as SlotType);
        toast.success("Meeting rescheduled successfully!");
        onClose();
        router.refresh();
      } catch {
        toast.error("Failed to reschedule meeting.");
      }
    });
  };

  return (
    <form
      className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,220px)]"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <CalendarField name="date" control={form.control} label="Choose new date" />

      {date && (
        <SlotField
          name="slot"
          control={form.control}
          date={formatDateKey(date)}
          userId={availabilityOwnerId}
          duration={duration}
        />
      )}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Rescheduling..." : "Reschedule"}
        </Button>
      </div>
    </form>
  );
}
