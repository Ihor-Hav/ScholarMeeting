import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlots(
  duration: number,
  startTime: Date,
  endTime: Date,
) {
  const step = duration * 60 * 1000;

  if (step <= 0) return [];

  const start = startTime.getTime();
  const end = endTime.getTime();

  const slots = [];

  for (let t = start; t + step <= end; t += step) {
    slots.push({
      startTime: new Date(t),
      endTime: new Date(t + step),
    });
  }

  return slots;
}

export function mergeDateAndTime(dateValue: Date, timeValue: Date) {
  return new Date(
    dateValue.getFullYear(),
    dateValue.getMonth(),
    dateValue.getDate(),
    timeValue.getHours(),
    timeValue.getMinutes(),
    timeValue.getSeconds(),
  );
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error("INVALID_DATE");
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    !year ||
    !month ||
    !day ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("INVALID_DATE");
  }

  return { year, month, day };
}

export function getTimeParts(dateValue: Date) {
  return {
    hours: dateValue.getHours(),
    minutes: dateValue.getMinutes(),
    seconds: dateValue.getSeconds(),
  };
}

export function getTimePartsInTimeZone(dateValue: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(dateValue);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    hours: value("hour"),
    minutes: value("minute"),
    seconds: value("second"),
  };
}

export function getDatePartsInTimeZone(dateValue: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dateValue);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
}

function getTimeZoneOffsetMs(dateValue: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(dateValue);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const asUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );

  return asUtc - dateValue.getTime();
}

export function makeDateInTimeZone(
  dateParts: { year: number; month: number; day: number },
  timeParts: { hours: number; minutes: number; seconds?: number },
  timeZone: string,
) {
  const utcGuess = new Date(
    Date.UTC(
      dateParts.year,
      dateParts.month - 1,
      dateParts.day,
      timeParts.hours,
      timeParts.minutes,
      timeParts.seconds || 0,
      0,
    ),
  );
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);
  const firstPass = new Date(utcGuess.getTime() - offset);
  const correctedOffset = getTimeZoneOffsetMs(firstPass, timeZone);

  return new Date(utcGuess.getTime() - correctedOffset);
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
