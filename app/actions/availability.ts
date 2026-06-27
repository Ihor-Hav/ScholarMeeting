"use server";

import { prisma } from "@/lib/prisma";
import { AppException } from "@/lib/errors";
import { withAction } from "@/lib/with-action";
import {
  getDatePartsInTimeZone,
  getTimePartsInTimeZone,
  makeDateInTimeZone,
  parseDateKey,
} from "@/lib/utils";
import {
  MAX_SLOT_DURATION,
  MIN_SLOT_DURATION,
  getWeekday,
  isValidTimeZone,
} from "@/lib/availability-rules";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

type AvailabilityDayUpdate = {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  slotDuration: number;
  timezone?: string | null;
};

const DEFAULT_TIMEZONE = "UTC";

function getMinutesSinceMidnight(date: Date, timezone: string) {
  const parts = getTimePartsInTimeZone(date, timezone);
  return parts.hours * 60 + parts.minutes;
}

export async function getAvailabilityByDay(userId: string, dayN: number) {
  return withAction(async () => {
    if (!userId)
      throw new AppException({
        code: "Invalid ID",
        message: "User ID is empty",
      });

    return await prisma.availability.findFirst({
      where: {
        dayOfWeek: dayN,
        userId,
      },
    });
  });
}

export async function getAvailableSlotsForDate(
  userId: string,
  dateValue: string,
  meetingDuration: number,
) {
  return withAction(async () => {
    if (!userId) {
      throw new AppException({
        code: "Invalid ID",
        message: "User ID is empty",
      });
    }

    if (
      !Number.isInteger(meetingDuration) ||
      meetingDuration < MIN_SLOT_DURATION ||
      meetingDuration > MAX_SLOT_DURATION
    ) {
      throw new AppException({
        code: "Invalid duration",
        message: "Meeting duration is invalid",
      });
    }

    const selectedDateParts = parseDateKey(dateValue);
    const selectedDayOfWeek = getWeekday(selectedDateParts);

    const availabilities = await prisma.availability.findMany({
      where: {
        userId,
        isActive: true,
        dayOfWeek: selectedDayOfWeek,
      },
      orderBy: { startTime: "asc" },
    });

    const meetingDurationMs = meetingDuration * 60 * 1000;
    const availableSlots = new Map<
      string,
      { startDate: Date; endDate: Date; availabilityId: string }
    >();
    const now = new Date();

    const searchStart = new Date(
      Date.UTC(
        selectedDateParts.year,
        selectedDateParts.month - 1,
        selectedDateParts.day - 1,
      ),
    );
    const searchEnd = new Date(
      Date.UTC(
        selectedDateParts.year,
        selectedDateParts.month - 1,
        selectedDateParts.day + 2,
      ),
    );
    const bookedSlots = await prisma.slot.findMany({
      where: {
        availability: { userId },
        status: "BOOKED",
        startDate: { lt: searchEnd },
        endDate: { gt: searchStart },
      },
      select: { startDate: true, endDate: true },
    });

    for (const availability of availabilities) {
      const timezone = availability.timezone || DEFAULT_TIMEZONE;
      if (
        !isValidTimeZone(timezone) ||
        availability.slotDuration < MIN_SLOT_DURATION ||
        availability.slotDuration > MAX_SLOT_DURATION
      ) {
        continue;
      }

      const availabilityStart = makeDateInTimeZone(
        selectedDateParts,
        getTimePartsInTimeZone(availability.startTime, timezone),
        timezone,
      );
      const availabilityEnd = makeDateInTimeZone(
        selectedDateParts,
        getTimePartsInTimeZone(availability.endTime, timezone),
        timezone,
      );
      const stepMs = availability.slotDuration * 60 * 1000;

      if (availabilityEnd <= availabilityStart) continue;

      for (
        let start = availabilityStart.getTime();
        start + meetingDurationMs <= availabilityEnd.getTime();
        start += stepMs
      ) {
        const end = start + meetingDurationMs;
        const overlapsBookedSlot = bookedSlots.some(
          (slot: { startDate: Date; endDate: Date }) =>
            start < slot.endDate.getTime() && end > slot.startDate.getTime(),
        );

        if (!overlapsBookedSlot && start > now.getTime()) {
          const key = `${start}-${end}`;
          if (!availableSlots.has(key)) availableSlots.set(key, {
            startDate: new Date(start),
            endDate: new Date(end),
            availabilityId: availability.id,
          });
        }
      }
    }

    return Array.from(availableSlots.values()).sort(
      (first, second) => first.startDate.getTime() - second.startDate.getTime(),
    );
  });
}

export async function getAvailableDays(userId: string) {
  return withAction(async () => {
    if (!userId)
      throw new AppException({
        code: "Invalid ID",
        message: "User ID is empty",
      });

    return await prisma.availability.findMany({
      where: {
        userId,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  });
}

export async function addAvailableDay(
  dayNumber: number,
  userId: string,
  timezone = DEFAULT_TIMEZONE,
) {
  return withAction(async () => {
    if (!userId)
      throw new AppException({
        code: "Invalid ID",
        message: "User ID is empty",
      });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== userId) {
      throw new AppException({
        code: "AVAILABILITY_ACCESS_DENIED",
        message: "You cannot modify this availability",
      });
    }

    if (!Number.isInteger(dayNumber) || dayNumber < 0 || dayNumber > 6) {
      throw new AppException({
        code: "INVALID_DAY_OF_WEEK",
        message: "Day of week must be between 0 and 6",
      });
    }

    if (!isValidTimeZone(timezone)) {
      throw new AppException({
        code: "INVALID_TIMEZONE",
        message: "Timezone is invalid",
      });
    }

    const existingRanges = await prisma.availability.findMany({
      where: { userId, dayOfWeek: dayNumber },
    });
    const intervals = existingRanges.map((range) => ({
      start: getMinutesSinceMidnight(
        range.startTime,
        range.timezone || DEFAULT_TIMEZONE,
      ),
      end: getMinutesSinceMidnight(
        range.endTime,
        range.timezone || DEFAULT_TIMEZONE,
      ),
    }));

    let startMinutes = 9 * 60;
    let endMinutes = 17 * 60;

    if (intervals.length > 0) {
      const candidates = [
        ...Array.from({ length: 30 }, (_, index) => 9 * 60 + index * 30),
        ...Array.from({ length: 18 }, (_, index) => index * 30),
      ];
      const candidate = candidates.find((start) => {
        const end = start + 60;
        return (
          end <= 24 * 60 &&
          !intervals.some((range) => start < range.end && end > range.start)
        );
      });

      if (candidate === undefined) {
        throw new AppException({
          code: "NO_AVAILABLE_TIME_RANGE",
          message: "There is no free time left on this day",
        });
      }

      startMinutes = candidate;
      endMinutes = candidate + 60;
    }

    const dateParts = getDatePartsInTimeZone(new Date(), timezone);
    const startDate = makeDateInTimeZone(
      dateParts,
      { hours: Math.floor(startMinutes / 60), minutes: startMinutes % 60 },
      timezone,
    );
    const endDate = makeDateInTimeZone(
      dateParts,
      { hours: Math.floor(endMinutes / 60), minutes: endMinutes % 60 },
      timezone,
    );

    const availability = await prisma.availability.create({
      data: {
        userId,
        dayOfWeek: dayNumber,
        startTime: startDate,
        endTime: endDate,
        slotDuration: 30,
        timezone,
      },
    });

    return availability;
  });
}

export async function deleteAvailableDay(dayId: string) {
  return withAction(async () => {
    if (!dayId)
      throw new AppException({
        code: "Invalid ID",
        message: "day ID is empty",
      });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppException({
        code: "UNAUTHORIZED",
        message: "You must be signed in",
      });
    }

    const availability = await prisma.availability.findUnique({
      where: { id: dayId },
      select: { userId: true },
    });

    if (!availability || availability.userId !== session.user.id) {
      throw new AppException({
        code: "AVAILABILITY_ACCESS_DENIED",
        message: "You cannot modify this availability",
      });
    }

    return await prisma.availability.delete({
      where: {
        id: dayId,
      },
    });
  });
}

export async function updateAvailableDays(days: AvailabilityDayUpdate[]) {
  return withAction(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new AppException({
        code: "UNAUTHORIZED",
        message: "You must be signed in",
      });
    }

    const uniqueIds = new Set(days.map((day) => day.id));
    if (uniqueIds.size !== days.length) {
      throw new AppException({
        code: "DUPLICATE_AVAILABILITY",
        message: "Availability contains duplicate ranges",
      });
    }

    const existingDays = await prisma.availability.findMany({
      where: { userId: session.user.id },
    });

    if (
      days.some((day) => !existingDays.some((existing) => existing.id === day.id))
    ) {
      throw new AppException({
        code: "AVAILABILITY_ACCESS_DENIED",
        message: "One or more availability ranges are invalid",
      });
    }

    const normalizedDays = days.map((day) => {
      const startTime = new Date(day.startTime);
      const endTime = new Date(day.endTime);
      const timezone = day.timezone || DEFAULT_TIMEZONE;

      if (!isValidTimeZone(timezone)) {
        throw new AppException({
          code: "INVALID_TIMEZONE",
          message: "Timezone is invalid",
        });
      }

      const startMinutes = Number.isFinite(startTime.getTime())
        ? getMinutesSinceMidnight(startTime, timezone)
        : NaN;
      const endMinutes = Number.isFinite(endTime.getTime())
        ? getMinutesSinceMidnight(endTime, timezone)
        : NaN;

      if (
        !Number.isFinite(startTime.getTime()) ||
        !Number.isFinite(endTime.getTime()) ||
        endMinutes <= startMinutes
      ) {
        throw new AppException({
          code: "INVALID_AVAILABILITY_RANGE",
          message: "End time must be later than start time",
        });
      }

      if (
        !Number.isInteger(day.slotDuration) ||
        day.slotDuration < MIN_SLOT_DURATION ||
        day.slotDuration > MAX_SLOT_DURATION
      ) {
        throw new AppException({
          code: "INVALID_SLOT_DURATION",
          message: "Slot duration is invalid",
        });
      }

      return { ...day, startTime, endTime, timezone };
    });

    const candidateDays = existingDays.map((existing) => {
      const update = normalizedDays.find((day) => day.id === existing.id);
      return update ? { ...existing, ...update } : {
        ...existing,
        timezone: existing.timezone || DEFAULT_TIMEZONE,
      };
    });

    for (let index = 0; index < candidateDays.length; index += 1) {
      const current = candidateDays[index];

      for (
        let otherIndex = index + 1;
        otherIndex < candidateDays.length;
        otherIndex += 1
      ) {
        const other = candidateDays[otherIndex];

        if (current.dayOfWeek === other.dayOfWeek) {
          const currentStart = getMinutesSinceMidnight(
            current.startTime,
            current.timezone,
          );
          const currentEnd = getMinutesSinceMidnight(
            current.endTime,
            current.timezone,
          );
          const otherStart = getMinutesSinceMidnight(
            other.startTime,
            other.timezone,
          );
          const otherEnd = getMinutesSinceMidnight(
            other.endTime,
            other.timezone,
          );

          if (currentStart < otherEnd && currentEnd > otherStart) {
            throw new AppException({
              code: "OVERLAPPING_AVAILABILITY",
              message: "Availability ranges on the same day cannot overlap",
            });
          }
        }
      }
    }

    const updates = normalizedDays.map((day) =>
      prisma.availability.update({
        where: { id: day.id },
        data: {
          startTime: day.startTime,
          endTime: day.endTime,
          slotDuration: day.slotDuration,
          timezone: day.timezone || DEFAULT_TIMEZONE,
        },
      }),
    );

    return await prisma.$transaction(updates);
  });
}

export async function getSlots(date: Date) {
  return withAction(async () => {
    const slots = await prisma.slot.findMany({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    return slots || [];
  });
}
