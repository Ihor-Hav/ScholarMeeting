import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { meetingSchema } from "@/schemas/meeting.zod";
import type { MeetingFormValues } from "@/schemas/meeting.shared";
import MeetingFields from "@/components/meetings/MeetingFields";
import type { schedulingWithId } from "@/schemas/scheduling.shared";
import { Button } from "@/components/ui/button";
import type { ContactTypeProps } from "@/types/contact.types";
import { createMeeting } from "@/app/actions/meetings";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { capitalizeWords } from "@/lib/utils";
import { toast } from "sonner";

import { getUserPlugins } from "@/app/actions/plugins";
import { getOrganizationInviteOptions } from "@/app/actions/organization";
import type { OrganizationInviteOption } from "@/schemas/meeting.shared";

type MeetingCreationFormProps = {
  scheduling: schedulingWithId;
  organizerId: string;
  contacts: ContactTypeProps[];
  onClose: () => void;
};

export default function MeetingCreationForm({
  scheduling,
  organizerId,
  contacts,
  onClose,
}: MeetingCreationFormProps) {
  const [plugins, setPlugins] = useState<string[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<
    OrganizationInviteOption[]
  >([]);

  const form = useForm<MeetingFormValues>({
    defaultValues: {
      title: scheduling.title,
      description: scheduling.description || "",
      comment: "",
      date: new Date(),
      slot: {},
      meetingType: scheduling.MeetingType,
      duration: scheduling.duration,
      location: scheduling.location || null,
      participants: [],
      meetingMembers: scheduling.MeetingMembers,
      addToGoogleCalendar: false,
    },

    resolver: zodResolver(meetingSchema),
  });

  const { data: session } = useSession();

  const handleCreate = async (data: MeetingFormValues) => {
    if (!session?.user.id) return;

    if (
      data.meetingType !== "IN_PERSON" &&
      !plugins.includes(data.meetingType)
    ) {
      form.setError("meetingType", {
        type: "manual",
        message: `You have not connected ${capitalizeWords(
          data.meetingType.replaceAll("_", " "),
        )}.`,
      });

      return;
    }

    try {
      await createMeeting(data, organizerId, scheduling.hostId, scheduling.id);

      toast.success("Meeting created successfully!");
      onClose();
    } catch {
      toast.error("Failed to create meeting!");
    }
  };

  useEffect(() => {
    if (!session?.user.id) return;

    getUserPlugins(organizerId).then(setPlugins).catch(console.error);
  }, [organizerId, session?.user.id]);

  useEffect(() => {
    if (!scheduling.organizationId || scheduling.MeetingMembers !== "ORGANIZATION") {
      return;
    }

    getOrganizationInviteOptions(scheduling.organizationId)
      .then(setOrganizationMembers)
      .catch(console.error);
  }, [scheduling.MeetingMembers, scheduling.organizationId]);

  return (
    <form onSubmit={form.handleSubmit((data) => handleCreate(data))}>
      <MeetingFields
        form={form}
        organizerId={organizerId}
        availabilityOwnerId={scheduling.hostId}
        contacts={contacts}
        organizationMembers={organizationMembers}
      />

      <div className="flex justify-end gap-2 mt-5 mb-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>

        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}
