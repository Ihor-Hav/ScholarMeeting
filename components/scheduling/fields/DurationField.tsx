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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Controller, FieldValues, Control, Path } from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

export default function DurationField<T extends FieldValues>({
  control,
  name,
}: Props<T>) {
  const [isCustom, setIsCustom] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Duration</FieldLabel>

          <Select
            value={isCustom ? "custom" : String(field.value ?? "")}
            onValueChange={(val) => {
              if (val === "custom") {
                setIsCustom(true);
                field.onChange(null);
              } else {
                setIsCustom(false);
                field.onChange(Number(val));
              }
            }}
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select a duration" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Duration</SelectLabel>

                {[15, 30, 45, 60].map((item) => (
                  <SelectItem value={String(item)} key={item}>
                    {item} min.
                  </SelectItem>
                ))}

                <SelectItem value="custom">Custom</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {isCustom && (
            <div className="flex flex-col gap-2 mx-3 py-2">
              <Label htmlFor="customValue">Set custom value</Label>
              <Input
                id="customValue"
                type="number"
                placeholder="120 min."
                value={field.value ?? ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? null : Number(e.target.value);
                  field.onChange(val);
                }}
              />
            </div>
          )}

          {fieldState.error && (
            <FieldError className="text-red-500 flex flex-col gap-2">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}
