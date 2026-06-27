"use client";

import { useForm } from "react-hook-form";
import { schedulingSchema } from "@/schemas/scheduling.zod";
import type {
  schedulingType,
  schedulingWithId,
} from "@/schemas/scheduling.shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { updateSchedualById } from "@/app/actions/scheduling";
import SchedualingFields from "@/components/scheduling/SchedualingFields";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import type { SchedulingOrganizationOption } from "@/components/scheduling/fields/OrganizationRulesField";

type SchedulingUpdateFormProps = {
  initialData: schedulingWithId;
  onSuccess: () => void;
  organizations: SchedulingOrganizationOption[];
};

export function SchedulingUpdateForm({
  onSuccess,
  initialData,
  organizations,
}: SchedulingUpdateFormProps) {
  const { data: session, status } = useSession();

  const form = useForm<schedulingType>({
    defaultValues: {
      title: initialData.title,
      description: initialData.description || "",
      week_days: initialData.week_days,
      duration: initialData.duration,
      location: initialData.location || "",
      max_members: initialData.max_members,
      MeetingType: initialData.MeetingType,
      MeetingMembers: initialData.MeetingMembers,
      bookingVisibility: initialData.bookingVisibility,
      organizationId: initialData.organizationId || null,
      requiredHostRole: initialData.requiredHostRole || null,
      requiredGuestRole: initialData.requiredGuestRole || null,
    },
    resolver: zodResolver(schedulingSchema),
    mode: "onSubmit",
  });

  const handleSubmit = async (data: schedulingType) => {
    try {
      await updateSchedualById(data, initialData.id);
      toast.success("Scheduling updated");
      onSuccess();
    } catch {
      toast.error("Failed to update scheduling");
    }
  };

  if (status === "loading") {
    return <div>loading</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <SchedualingFields
        form={form}
        organizerId={session?.user.id || ""}
        organizations={organizations}
      />

      <div className="flex justify-end gap-2 mt-5 mb-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Close
        </Button>

        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
