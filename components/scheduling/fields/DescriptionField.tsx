import { Controller, FieldValues, Control, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
};

export default function DescriptionField<T extends FieldValues>({
  control,
  name,
  label = "Description",
  placeholder = "This meeting for students...",
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Textarea {...field} placeholder={placeholder} />
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
