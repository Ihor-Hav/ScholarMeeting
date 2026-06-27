"use client";

import { useForm } from "react-hook-form";
import { schedulingSchema } from "@/schemas/scheduling.zod";
import type { schedulingType, schedulingWithId } from "@/schemas/scheduling.shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { createSchedualing } from "@/app/actions/scheduling";
import SchedualingFields from "@/components/scheduling/SchedualingFields";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import type { SchedulingOrganizationOption } from "@/components/scheduling/fields/OrganizationRulesField";

type Props = {
  onSuccess: (scheduling?: schedulingWithId) => void;
  organizations: SchedulingOrganizationOption[];
};

export function SchedulingForm({ onSuccess, organizations }: Props) {
  const { data: session, status } = useSession();

  const form = useForm<schedulingType>({
    defaultValues: {
      title: "",
      description: "",
      week_days: [],
      duration: 30,
      location: "",
      max_members: 2,
      MeetingType: "GOOGLE_MEET",
      MeetingMembers: "ONE_ON_ONE",
      bookingVisibility: "PUBLIC",
      organizationId: null,
      requiredHostRole: null,
      requiredGuestRole: null,
    },
    resolver: zodResolver(schedulingSchema),
    mode: "onSubmit",
  });

  const handleSubmit = async (data: schedulingType) => {
    if (!session?.user.id) return;

    try {
      const scheduling = await createSchedualing(data, session.user.id);
      toast.success("Scheduling created");
      onSuccess(scheduling);
    } catch {
      toast.error("Failed to create scheduling");
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
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
        >
          Close
        </Button>

        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}
