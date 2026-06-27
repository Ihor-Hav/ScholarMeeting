import { Controller } from "react-hook-form";
import { SchedualingFormValues } from "@/components/scheduling/SchedualingFields";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type SchedulingOrganizationOption = {
  id: string;
  name: string;
  role: "OWNER" | "TEACHER" | "STUDENT";
};

type Props = {
  form: SchedualingFormValues;
  organizations: SchedulingOrganizationOption[];
};

export default function OrganizationRulesField({ form, organizations }: Props) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div>
        <FieldLabel>Organization context</FieldLabel>
        <p className="text-xs text-muted-foreground">
          Organization meetings are explicitly teacher-to-student: a teacher owns
          the availability and students book it inside the selected organization.
        </p>
      </div>

      <Controller
        name="organizationId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <Select
              value={field.value || ""}
              onValueChange={(value) => field.onChange(value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Organizations</SelectLabel>
                  {organizations.map((organization) => (
                    <SelectItem key={organization.id} value={organization.id}>
                      {organization.name} · {organization.role}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldState.error && (
              <FieldError className="text-red-500">
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Host role: TEACHER</Badge>
        <Badge variant="outline">Guest role: STUDENT</Badge>
      </div>
    </div>
  );
}
