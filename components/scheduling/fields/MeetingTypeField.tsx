"use client";

import { UserRound, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Controller,
  FieldValues,
  Path,
  UseFormReturn,
} from "react-hook-form";

const MEETING_TYPES = [
  {
    value: "GOOGLE_MEET" as const,
    label: "Google Meet",
    icon: <img src="/google-meet.svg" alt="Google Meet" className="h-8 w-8" />,
  },
  {
    value: "ZOOM" as const,
    label: "Zoom",
    icon: <img src="/zoom.svg" alt="Zoom" className="h-8 w-8" />,
  },
  {
    value: "IN_PERSON" as const,
    label: "In Person",
    icon: <UserRound className="h-8 w-8" />,
  },
];

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
};

export default function MeetingTypeField<T extends FieldValues>({
  form,
  name,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Meeting Type</FieldLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MEETING_TYPES.map((type) => {
              const active = type.value === field.value;

              return (
                <Card
                  key={type.value}
                  onClick={() => field.onChange(type.value)}
                  className={`
                    relative cursor-pointer text-center
                    transition-all duration-150
                    ${
                      active
                        ? "bg-blue-500/10 border-blue-500"
                        : "hover:bg-blue-500/10 border-blue-400/20"
                    }
                  `}
                >
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <span>{type.icon}</span>
                    <p className="select-none text-sm mt-1">{type.label}</p>

                    {active && (
                      <span className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-blue-500 text-white">
                        <Check size={16} />
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {fieldState.error && (
            <FieldError>{fieldState.error?.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
}
