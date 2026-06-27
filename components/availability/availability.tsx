"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import SelectTime from "@/components/common/select-time";
import { useMemo, useEffect, useState } from "react";
import {
  getAvailableDays,
  addAvailableDay,
  deleteAvailableDay,
  updateAvailableDays,
} from "@/app/actions/availability";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Availability as AvailabilityModel } from "@/generated/prisma/client";

const FALLBACK_TIMEZONES = [
  "UTC",
  "Europe/Kyiv",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Warsaw",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function getSupportedTimezones() {
  if (typeof Intl.supportedValuesOf !== "function") {
    return FALLBACK_TIMEZONES;
  }

  return Intl.supportedValuesOf("timeZone");
}

export default function Availability() {
  const { data: session, status } = useSession();
  const [availableDays, setAvailableDays] = useState<AvailabilityModel[]>([]);
  const localTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );
  const timezoneOptions = useMemo(() => {
    const options = getSupportedTimezones();

    return options.includes(localTimezone)
      ? options
      : [localTimezone, ...options];
  }, [localTimezone]);

  const daysOfWeek = useMemo(() => [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ], []);

  const handleSave = async () => {
    try {
      const rangesByDay = new Map<number, Array<{ start: number; end: number }>>();

      for (const day of availableDays) {
        const start = new Date(day.startTime);
        const end = new Date(day.endTime);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();

        if (
          !Number.isFinite(start.getTime()) ||
          !Number.isFinite(end.getTime()) ||
          endMinutes <= startMinutes
        ) {
          toast.error("End time must be later than start time");
          return;
        }

        const dayNumber = day.dayOfWeek;
        if (dayNumber === null) {
          toast.error("Availability must have a valid day of week");
          return;
        }

        const ranges = rangesByDay.get(dayNumber) || [];
        if (
          ranges.some(
            (range) => startMinutes < range.end && endMinutes > range.start,
          )
        ) {
          toast.error("Availability ranges on the same day cannot overlap");
          return;
        }

        ranges.push({ start: startMinutes, end: endMinutes });
        rangesByDay.set(dayNumber, ranges);
      }

      const result = await updateAvailableDays(
        availableDays.map((day) => ({
          ...day,
          timezone: day.timezone || localTimezone,
        })),
      );

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Successfully updated!");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const fetchDays = async () => {
      try {
        const fetchedDays = await getAvailableDays(session.user.id);
        if (fetchedDays.ok) {
          setAvailableDays(
            fetchedDays.data.map((day) => ({
              ...day,
              timezone: day.timezone || localTimezone,
            })),
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDays();
  }, [localTimezone, session, status]);

  const addNewDay = async (dayNumber: number) => {
    try {
      const newDay = await addAvailableDay(
        dayNumber,
        session?.user.id || "",
        localTimezone,
      );

      if (newDay.ok) {
        setAvailableDays((prev) => [...prev, newDay.data]);
      } else {
        toast.error(newDay.error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const mergedDays = useMemo(() =>
    daysOfWeek.map((day, index) => ({
      day,
      index,
      data: availableDays.filter((d) => d.dayOfWeek === index),
    })),
    [availableDays, daysOfWeek],
  );

  const handleDeleteDay = async (dayId: string) => {
    try {
      const result = await deleteAvailableDay(dayId);

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      setAvailableDays((prev) => prev.filter((day) => day.id !== dayId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTimeChange = (
    id: string,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setAvailableDays((prev) =>
      prev.map((day) => (day.id === id ? { ...day, [field]: value } : day)),
    );
  };

  const handleTimezoneChange = (id: string, timezone: string) => {
    setAvailableDays((prev) =>
      prev.map((day) => (day.id === id ? { ...day, timezone } : day)),
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-3xl font-semibold text-center mb-6">Availability</h2>

      <div className="flex flex-col gap-4">
        {mergedDays.map(({ day, index, data }) => (
          <Card
            key={index}
            className="rounded-2xl shadow-sm border hover:shadow-md transition"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">{day}</CardTitle>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => addNewDay(daysOfWeek.indexOf(day))}
              >
                <Plus className="w-4 h-4" /> Add time range
              </Button>
            </CardHeader>

            {data.length > 0 && (
              <CardContent className="space-y-4">
                {data.map((range) => (
                  <div
                    key={range.id}
                    className="rounded-xl border p-3 space-y-4"
                  >
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-100"
                        onClick={() => handleDeleteDay(range.id)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Time range
                      </p>
                      <div className="flex gap-2">
                        <SelectTime
                          defaultValue={String(range.startTime)}
                          onChange={(val) =>
                            handleTimeChange(range.id, "startTime", val)
                          }
                        />
                        <SelectTime
                          defaultValue={String(range.endTime)}
                          onChange={(val) =>
                            handleTimeChange(range.id, "endTime", val)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Timezone
                      </p>
                      <Select
                        value={range.timezone || localTimezone}
                        onValueChange={(value) =>
                          handleTimezoneChange(range.id, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Timezones</SelectLabel>
                            {timezoneOptions.map((timezone) => (
                              <SelectItem key={timezone} value={timezone}>
                                {timezone.replaceAll("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Slot duration
                      </p>
                      <Select
                        value={String(range.slotDuration)}
                        onValueChange={(val) =>
                          setAvailableDays((prev) =>
                            prev.map((day) =>
                              day.id === range.id
                                ? { ...day, slotDuration: Number(val) }
                                : day,
                            ),
                          )
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Minutes</SelectLabel>
                            {[15, 30, 45, 60].map((item) => (
                              <SelectItem key={item} value={String(item)}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      <div className="flex justify-center my-10">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
