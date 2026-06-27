import { Controller } from "react-hook-form";
import { SchedualingFormValues } from "@/components/scheduling/SchedualingFields";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  form: SchedualingFormValues;
};

export default function MaxMembersField({ form }: Props) {
  return (
    <Controller
      name="max_members"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>Max Members</FieldLabel>
          <Input
            {...field}
            type="number"
            placeholder="20"
            value={field.value ?? ""}
            onChange={(e) =>
              field.onChange(
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
          {fieldState.error && (
            <FieldError className="text-red-500">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}
