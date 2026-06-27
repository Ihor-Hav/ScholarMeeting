"use client";

import { useState } from "react";
import { Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

type Props = {
  defaultValue: string;
  onChange?: (time: string) => void;
};

function parseTimeValue(value: string) {
  if (!value) return { hours: null, minutes: null };

  const date = new Date(value);

  if (isNaN(date.getTime())) return { hours: null, minutes: null };

  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
}

export default function SelectTime({ defaultValue, onChange }: Props) {
  const initialTime = parseTimeValue(defaultValue);
  const [hours, setHours] = useState<number | null>(initialTime.hours);
  const [minutes, setMinutes] = useState<number | null>(initialTime.minutes);
  const [open, setOpen] = useState(false);

  const [tempHours, setTempHours] = useState<number | null>(hours);
  const [tempMinutes, setTempMinutes] = useState<number | null>(minutes);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempHours(hours);
      setTempMinutes(minutes);
    }

    setOpen(nextOpen);
  };

  const hoursInTimer = Array.from({ length: 24 }, (_, i) => i);
  const minutesInTimer = Array.from({ length: 13 }, (_, i) => i * 5);

  const getTimeValue = () => {
    if (hours === null || minutes === null || isNaN(hours) || isNaN(minutes)) {
      return "";
    }

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    if (isNaN(date.getTime())) return "";

    return format(date, "HH:mm");
  };

  return (
    <div>
      <DropdownMenu onOpenChange={handleOpenChange} open={open}>
        <div className="relative w-full h-full">
          <Input
            type="time"
            value={getTimeValue()}
            readOnly
            className="w-full h-full min-w-45"
          />
          <DropdownMenuTrigger>
            <Timer
              size={20}
              className="absolute top-1/2 -translate-y-1/2 right-3 hover:text-muted-foreground"
            />
          </DropdownMenuTrigger>
        </div>

        <DropdownMenuContent
          className="flex flex-col p-2 min-w-[220px]"
          side="bottom"
          align="start"
        >
          <div className="flex gap-4">
            <DropdownMenuGroup className="w-28">
              <DropdownMenuLabel className="sticky top-0 bg-white z-10 px-2 py-1">
                Hours
              </DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto">
                {hoursInTimer.map((hour) => (
                  <DropdownMenuItem
                    key={hour}
                    onSelect={(e) => {
                      e.preventDefault();
                      setTempHours(hour);
                    }}
                    className={`${
                      tempHours === hour ? "bg-blue-100 text-blue-800" : ""
                    } cursor-pointer`}
                  >
                    {hour}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuGroup>

            <DropdownMenuGroup className="w-28">
              <DropdownMenuLabel className="sticky top-0 bg-white z-10 px-2 py-1">
                Minutes
              </DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto">
                {minutesInTimer.map((min) => (
                  <DropdownMenuItem
                    key={min}
                    onSelect={(e) => {
                      e.preventDefault();
                      setTempMinutes(min);
                    }}
                    className={`${
                      tempMinutes === min ? "bg-blue-100 text-blue-800" : ""
                    } cursor-pointer`}
                  >
                    {min.toString().padStart(2, "0")}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuGroup>
          </div>

          <div className="flex justify-end gap-2 mt-2 border-t border-gray-200 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTempHours(hours);
                setTempMinutes(minutes);
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setHours(tempHours);
                setMinutes(tempMinutes);

                const date = new Date();
                date.setHours(tempHours ?? 0, tempMinutes ?? 0, 0, 0);

                onChange?.(date.toISOString());
                setOpen(false);
              }}
            >
              OK
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
