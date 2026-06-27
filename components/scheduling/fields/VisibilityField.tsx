import type { SchedualingFormValues } from "@/components/scheduling/SchedualingFields";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { BOOKING_VISIBILITIES } from "@/schemas/scheduling.shared";

type Props = {
  form: SchedualingFormValues;
};

export default function VisibilityField({ form }: Props) {
  return (
    <Controller
      name="bookingVisibility"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Booking Visibility</FieldLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select a duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Booking Visibility</SelectLabel>
                {BOOKING_VISIBILITIES.map((item) => (
                  <SelectItem value={item} key={item}>
                    {item}
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
    ></Controller>
  );
}
