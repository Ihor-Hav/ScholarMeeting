"use client";

import { useEffect, useState, memo } from "react";
import { useController } from "react-hook-form";
import type { FieldValues, Path, Control } from "react-hook-form";
import { FieldLabel } from "@/components/ui/field";
import { getAvailableSlotsForDate } from "@/app/actions/availability";
import type { SlotType } from "@/schemas/meeting.shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SlotFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  control: Control<T>;
  date: string;
  userId: string;
  duration: number;
};

const SlotButton = memo(
  ({
    slot,
    selected,
    onSelect,
  }: {
    slot: SlotType;
    selected: boolean;
    onSelect: (slot: SlotType) => void;
  }) => {
    if (!slot.startDate) return null;

    return (
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "border transition-colors",
          selected
            ? "!bg-blue-400/30 hover:!bg-blue-400/30"
            : "hover:bg-blue-200/30",
        )}
        onClick={() => onSelect(slot)}
      >
        {new Date(slot.startDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Button>
    );
  },
);

SlotButton.displayName = "SlotButton";

export default function SlotField<T extends FieldValues>({
  name,
  label = "Choose Available Slot",
  control,
  date,
  userId,
  duration,
}: SlotFieldProps<T>) {
  const [slots, setSlots] = useState<SlotType[]>([]);
  const [loading, setLoading] = useState(false);
  const { field, fieldState } = useController({ name, control });
  const selectedSlot = field.value as SlotType | undefined;
  const { onChange } = field;

  useEffect(() => {
    let active = true;
    onChange({});

    const fetch = async () => {
      if (!userId || !date || !duration) {
        setSlots([]);
        return;
      }

      setLoading(true);

      try {
        const res = await getAvailableSlotsForDate(userId, date, duration);
        if (active) setSlots(res?.ok ? res.data : []);
      } catch {
        if (active) setSlots([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetch();

    return () => {
      active = false;
    };
  }, [date, duration, userId, onChange]);

  return (
    <div>
      {slots.length > 0 && <FieldLabel>{label}</FieldLabel>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading slots...</p>
      ) : !slots.length ? (
        <p className="text-sm text-muted-foreground">
          No available slots for this duration
        </p>
      ) : (
        <div className="flex max-h-100 flex-col gap-1 overflow-y-auto px-2 py-2">
          {slots.map((slot) => (
            <SlotButton
              key={`${slot.availabilityId}-${slot.startDate?.getTime()}`}
              slot={slot}
              selected={
                selectedSlot?.startDate?.getTime?.() ===
                slot.startDate?.getTime()
              }
              onSelect={(selectedSlot) =>
                field.onChange({
                  startDate: selectedSlot.startDate,
                  endDate: selectedSlot.endDate,
                  availabilityId: selectedSlot.availabilityId,
                })
              }
            />
          ))}
        </div>
      )}

      {fieldState.error && (
        <p className="text-sm text-red-500 mt-2">
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}
