import type { schedulingType } from "@/schemas/scheduling.shared";
import { FieldGroup } from "@/components/ui/field";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import TitleField from "@/components/scheduling/fields/TitleField";
import DescriptionField from "@/components/scheduling/fields/DescriptionField";
import LocationField from "@/components/scheduling/fields/LocationField";
import MeetingTypeField from "@/components/scheduling/fields/MeetingTypeField";
import MeetingMembersField from "@/components/scheduling/fields/MeetingMembersField";
import MaxMembersField from "@/components/scheduling/fields/MaxMembersField";
import DurationField from "@/components/scheduling/fields/DurationField";
import VisibilityField from "@/components/scheduling/fields/VisibilityField";
import WeekDaysField from "@/components/scheduling/fields/WeekDaysField";
import OrganizationRulesField, {
  type SchedulingOrganizationOption,
} from "@/components/scheduling/fields/OrganizationRulesField";

export type SchedualingFormValues = UseFormReturn<schedulingType>;

type Props = {
  form: SchedualingFormValues;
  organizerId: string;
  organizations?: SchedulingOrganizationOption[];
};

export default function SchedulingFields({
  form,
  organizerId,
  organizations = [],
}: Props) {
  const meetingType = useWatch({
    control: form.control,
    name: "MeetingType",
  });

  const meetingMembers = useWatch({
    control: form.control,
    name: "MeetingMembers",
  });

  return (
    <FieldGroup>
      <TitleField control={form.control} name="title" label="Title" />

      <DescriptionField
        control={form.control}
        name="description"
        label="Description"
      />

      <MeetingTypeField
        form={form}
        name="MeetingType"
      />

      {meetingType === "IN_PERSON" && (
        <LocationField control={form.control} name="location" />
      )}

      <MeetingMembersField form={form} />

      {meetingMembers === "GROUP" && <MaxMembersField form={form} />}

      {meetingMembers === "ORGANIZATION" && (
        <OrganizationRulesField form={form} organizations={organizations} />
      )}

      <DurationField control={form.control} name="duration" />

      <WeekDaysField form={form} userId={organizerId || ""} />

      <VisibilityField form={form} />
    </FieldGroup>
  );
}
