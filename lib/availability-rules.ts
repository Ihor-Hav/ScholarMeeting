import type { Availability } from "@/generated/prisma/client";
import {
  getDatePartsInTimeZone,
  getTimePartsInTimeZone,
  makeDateInTimeZone,
} from "@/lib/utils";

export const MIN_SLOT_DURATION = 5;
export const MAX_SLOT_DURATION = 24 * 60;

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function getWeekday(dateParts: {
  year: number;
  month: number;
  day: number;
}) {
  return new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day),
  ).getUTCDay();
}

export function assertValidSlotForAvailability(input: {
  availability: Availability;
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
}) {
  const { availability, startDate, endDate, durationMinutes } = input;
  const timezone = availability.timezone || "UTC";

  if (
    !Number.isFinite(startDate.getTime()) ||
    !Number.isFinite(endDate.getTime()) ||
    startDate <= new Date() ||
    endDate <= startDate
  ) {
    throw new Error("INVALID_SLOT_DATE_RANGE");
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    endDate.getTime() - startDate.getTime() !== durationMinutes * 60 * 1000
  ) {
    throw new Error("INVALID_SLOT_DURATION");
  }

  if (!availability.isActive || !isValidTimeZone(timezone)) {
    throw new Error("AVAILABILITY_NOT_ACTIVE");
  }

  const dateParts = getDatePartsInTimeZone(startDate, timezone);

  if (
    availability.dayOfWeek === null ||
    getWeekday(dateParts) !== availability.dayOfWeek
  ) {
    throw new Error("SLOT_DAY_DOES_NOT_MATCH_AVAILABILITY");
  }

  const availabilityStart = makeDateInTimeZone(
    dateParts,
    getTimePartsInTimeZone(availability.startTime, timezone),
    timezone,
  );
  const availabilityEnd = makeDateInTimeZone(
    dateParts,
    getTimePartsInTimeZone(availability.endTime, timezone),
    timezone,
  );

  if (startDate < availabilityStart || endDate > availabilityEnd) {
    throw new Error("SLOT_OUTSIDE_AVAILABILITY");
  }

  const stepMs = availability.slotDuration * 60 * 1000;
  if (
    stepMs <= 0 ||
    (startDate.getTime() - availabilityStart.getTime()) % stepMs !== 0
  ) {
    throw new Error("SLOT_NOT_ALIGNED_WITH_AVAILABILITY");
  }
}
