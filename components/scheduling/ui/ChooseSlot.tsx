"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Slot = {
  startTime: Date;
  endTime: Date;
};

type Props = {
  startTime: Date;
  endTime: Date;
  slot_duration: number;
  onSelectCallback: (value: Date) => void;
};

function generateSlots(startTime: Date, endTime: Date, slot_duration: number) {
  if (slot_duration <= 0) return [];

  const slots: Slot[] = [];
  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    const nextTime = new Date(currentTime.getTime() + slot_duration * 60000);

    slots.push({
      startTime: new Date(currentTime),
      endTime: nextTime,
    });

    currentTime = nextTime;
  }

  return slots;
}

export default function ChooseSlot({
  startTime,
  endTime,
  slot_duration,
  onSelectCallback,
}: Props) {
  const [selected, setSelected] = useState<Date | null>(null);

  const slots = useMemo(() => {
    if (!startTime || !endTime || slot_duration <= 0) return [];

    return generateSlots(startTime, endTime, slot_duration);
  }, [startTime, endTime, slot_duration]);

  useEffect(() => {
    if (selected) {
      onSelectCallback(selected);
    }
  }, [onSelectCallback, selected]);

  return (
    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
      {slots.map((slot, index) => {
        const label = slot.startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <Button
            key={index}
            variant={
              selected?.getTime() === slot.startTime.getTime()
                ? "default"
                : "outline"
            }
            className="w-full justify-center"
            onClick={() => setSelected(slot.startTime)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
