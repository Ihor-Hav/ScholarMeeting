import { Calendar } from "@/components/ui/calendar";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { FieldLabel, FieldError } from "@/components/ui/field";

type CalendarFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  errorMsg?: string;
  disablePast?: boolean;
};

export default function CalendarField<T extends FieldValues>({
  name,
  label = "Choose Date",
  control,
  errorMsg,
  disablePast = true,
}: CalendarFieldProps<T>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel>{label}</FieldLabel>
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={disablePast ? { before: today } : undefined}
          />
          {fieldState.error && (
            <FieldError className="text-red-500">
              {fieldState.error.message}
            </FieldError>
          )}

          {errorMsg && (
            <p className="text-sm text-center text-red-500 mt-2 max-w-50">
              {errorMsg}
            </p>
          )}
        </div>
      )}
    />
  );
}
