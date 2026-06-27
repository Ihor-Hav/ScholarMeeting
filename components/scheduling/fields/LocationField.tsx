import { Controller, FieldValues, Control, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
};

export default function LocationField<T extends FieldValues>({
  control,
  name,
  label = "Location",
  placeholder = "221B Baker Street, London",
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input {...field} placeholder={placeholder} />
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
