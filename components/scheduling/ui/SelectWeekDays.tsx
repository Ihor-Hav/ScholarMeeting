"use client";

import { getAvailableDays } from "@/app/actions/availability";
import { useEffect, useState } from "react";
import type { Availability } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import { WEEK_DAYS } from "@/components/scheduling/constants";

export const WeekDays = WEEK_DAYS;

type Props = {
  userId: string;
  value: number[];
  onChangeCallback: (value: number[]) => void;
};

export default function SelectWeekDays({
  userId,
  onChangeCallback,
}: Props) {
  const [initialDays, setInitialDays] = useState<Availability[]>([]);
  const [availableDays, setAvailableDays] = useState<Availability[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchAvailableDays = async () => {
      try {
        const fetchedDays = await getAvailableDays(userId);

        if (!fetchedDays.ok) {
          console.error("Failed to fetch available days:", fetchedDays.error);
          return;
        }

        const dayNumbers = fetchedDays.data
          .map((day) => day.dayOfWeek)
          .filter((day): day is number => day !== null);

        setAvailableDays(fetchedDays.data);
        setInitialDays(fetchedDays.data);
        onChangeCallback(dayNumbers);
      } catch (error) {
        console.error("ERROR: ", error);
      }
    };

    fetchAvailableDays();
  }, [onChangeCallback, userId]);

  const handleAdd = (dayOfWeek: number) => {
    const dayToAdd = initialDays.find((d) => d.dayOfWeek === dayOfWeek);
    if (!dayToAdd) return;

    setAvailableDays((prev) => {
      const updated = [...prev, dayToAdd];

      onChangeCallback(
        updated
          .map((day) => day.dayOfWeek)
          .filter((day): day is number => day !== null),
      );

      return updated;
    });
  };

  const handleRemove = (dayId: string) => {
    setAvailableDays((prev) => {
      const updated = prev.filter((d) => d.id !== dayId);

      onChangeCallback(
        updated
          .map((day) => day.dayOfWeek)
          .filter((day): day is number => day !== null),
      );

      return updated;
    });
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col gap-2">
      {WeekDays.map((day, day_idx) => {
        const availableDay = availableDays.find((d) => d.dayOfWeek === day_idx);

        const existsInitially = initialDays.find(
          (d) => d.dayOfWeek === day_idx,
        );

        if (availableDay) {
          return (
            <div
              key={day_idx}
              className="flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm bg-background hover:bg-muted/40 transition"
            >
              <div className="flex flex-col">
                <span className="font-medium">{day}</span>
                <span className="text-sm text-muted-foreground">
                  {formatTime(availableDay.startTime)} —{" "}
                  {formatTime(availableDay.endTime)}
                </span>
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(availableDay.id);
                }}
              >
                <Trash />
              </Button>
            </div>
          );
        }

        return (
          <div
            key={day_idx}
            className="flex items-center justify-between rounded-xl border px-4 py-3 opacity-60 hover:opacity-100 transition"
          >
            <span className="text-muted-foreground">{day}</span>

            {existsInitially && (
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
            )}
          </div>
        );
      })}
    </div>
  );
}
