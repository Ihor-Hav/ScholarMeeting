"use client";

import type { SchedualingFormValues } from "@/components/scheduling/SchedualingFields";
import { getAvailableDays } from "@/app/actions/availability";
import { useEffect, useState } from "react";
import type { Availability } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import { Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { WEEK_DAYS } from "@/components/scheduling/constants";

type Props = {
  form: SchedualingFormValues;
  userId: string;
};

export default function WeekDaysField({ form, userId }: Props) {
  const [initialDays, setInitialDays] = useState<Availability[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchAvailableDays = async () => {
      try {
        const result = await getAvailableDays(userId);

        if ("ok" in result && !result.ok) {
          console.error("Failed to fetch available days:", result.error);
          return;
        }

        if ("ok" in result && result.ok) {
          const days: Availability[] = result.data;

          console.error(days);
          setInitialDays(days);

          const daysNumbers: number[] = days
            .map((d) => d.dayOfWeek)
            .filter((d): d is number => d !== null);

          form.setValue("week_days", daysNumbers, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchAvailableDays();
  }, [userId, form]);

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Controller
      name="week_days"
      control={form.control}
      render={({ field, fieldState }) => {
        const selectedDays: number[] = field.value || [];

        const handleAdd = (dayOfWeek: number) => {
          if (!selectedDays.includes(dayOfWeek)) {
            field.onChange([...selectedDays, dayOfWeek]);
            form.clearErrors("week_days");
          }
        };

        const handleRemove = (dayOfWeek: number) => {
          field.onChange(selectedDays.filter((d) => d !== dayOfWeek));
        };

        return (
          <Field>
            <FieldLabel>Available Days</FieldLabel>

            <div className="flex flex-col gap-2">
              {WEEK_DAYS.map((day, day_idx) => {
                const isSelected = selectedDays.includes(day_idx);

                // Знайдемо availability для UI (щоб показати час)
                const availabilityForDay = initialDays.find(
                  (d) => d.dayOfWeek === day_idx,
                );

                if (isSelected && availabilityForDay) {
                  return (
                    <div
                      key={day_idx}
                      className="flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{day}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(availabilityForDay.startTime)} —{" "}
                          {formatTime(availabilityForDay.endTime)}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(day_idx);
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                }

                if (availabilityForDay) {
                  return (
                    <div
                      key={day_idx}
                      className="flex items-center justify-between rounded-xl border px-4 py-3 opacity-70"
                    >
                      <span>{day}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAdd(day_idx);
                        }}
                      >
                        <Plus />
                      </Button>
                    </div>
                  );
                }

                return (
                  <div
                    key={day_idx}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 opacity-50"
                  >
                    <span>{day}</span>
                    <span className="text-sm text-muted-foreground">
                      Not configured. Set in Availability
                    </span>
                  </div>
                );
              })}
            </div>

            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        );
      }}
    />
  );
}
