import { Controller, FieldValues, Control, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

export default function TitleField<T extends FieldValues>({
  control,
  name,
  label,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input {...field}></Input>
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
