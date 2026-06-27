import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { UseFormReturn } from "react-hook-form";
import TitleField from "@/components/scheduling/fields/TitleField";
import DescriptionField from "@/components/scheduling/fields/DescriptionField";
import LocationField from "@/components/scheduling/fields/LocationField";
import MeetingTypeField from "@/components/meetings/fields/MeetingTypeField";
import DurationField from "@/components/scheduling/fields/DurationField";
import CalendarField from "@/components/meetings/fields/CalendarField";
import ParticipantsField from "@/components/meetings/fields/ParticipantsField";
import SlotField from "@/components/meetings/fields/SlotField";
import { useWatch } from "react-hook-form";
import { MeetingFormValues } from "@/schemas/meeting.zod";
import { ContactTypeProps } from "@/types/contact.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { formatDateKey } from "@/lib/utils";
import OrganizationParticipantsField from "@/components/meetings/fields/OrganizationParticipantsField";
import type { OrganizationInviteOption } from "@/schemas/meeting.shared";
import { Textarea } from "@/components/ui/textarea";

export type MeetingFormTypeValues = UseFormReturn<MeetingFormValues>;

type Props = {
  form: MeetingFormTypeValues;
  organizerId: string;
  availabilityOwnerId: string;
  contacts: ContactTypeProps[];
  organizationMembers: OrganizationInviteOption[];
};

export default function MeetingFields({
  form,
  organizerId,
  availabilityOwnerId,
  contacts,
  organizationMembers,
}: Props) {
  const meetingType = useWatch({
    control: form.control,
    name: "meetingType",
  });

  const date = useWatch({
    control: form.control,
    name: "date",
  });

  const duration = useWatch({
    control: form.control,
    name: "duration",
  });

  const meetingMembers = form.getValues("meetingMembers");

  return (
    <div className="grid grid-cols-18 gap-4">
      <div className="col-span-8 overflow-y-scroll px-5 max-h-150">
        <FieldGroup>
          <TitleField control={form.control} name="title" label="Title" />
          <DescriptionField
            control={form.control}
            name="description"
            label="Description"
          />
          <Controller
            control={form.control}
            name="comment"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Message for the meeting</FieldLabel>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  maxLength={2000}
                  placeholder="Optional comment for the teacher and participants..."
                />
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
          <MeetingTypeField
            form={form}
            name="meetingType"
            userId={organizerId}
          />

          {meetingType === "IN_PERSON" && (
            <LocationField control={form.control} name="location" />
          )}

          <DurationField control={form.control} name="duration" />
          <Controller
            control={form.control}
            name="addToGoogleCalendar"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                Add this meeting to my Google Calendar
              </label>
            )}
          />

          {meetingMembers === "GROUP" && (
            <ParticipantsField
              name="participants"
              control={form.control}
              contacts={contacts}
              currentUserId={organizerId}
            />
          )}

          {meetingMembers === "ORGANIZATION" && (
            <OrganizationParticipantsField
              name="participants"
              control={form.control}
              members={organizationMembers}
              currentUserId={organizerId}
              hostId={availabilityOwnerId}
            />
          )}
        </FieldGroup>
      </div>
      <div className="col-span-10 flex gap-3">
        <CalendarField
          name="date"
          control={form.control}
          label="Choose Date"
          errorMsg={form.formState.errors.slot?.startDate?.message}
        />

        {date && (
          <SlotField
            name="slot"
            control={form.control}
            date={formatDateKey(date)}
            userId={availabilityOwnerId || ""}
            duration={duration}
          />
        )}
      </div>
    </div>
  );
}
