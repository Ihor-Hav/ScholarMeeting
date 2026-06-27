import z from "zod";
import { BOOKING_VISIBILITIES } from "@/schemas/scheduling.shared";
export { BOOKING_VISIBILITIES } from "@/schemas/scheduling.shared";
export type {
  schedulingType,
  schedulingWithId,
  updateSchedulingType,
} from "@/schemas/scheduling.shared";

const baseSchedulingSchema = z.object({
  title: z.string().min(2),
  description: z.string().nullish().optional(),
  week_days: z.array(z.number().int().min(0).max(6)).min(1),
  duration: z.number().int().min(15).max(180),
  location: z.string().nullish().optional(),
  max_members: z.number().int().min(2).max(60).nullable(),
  MeetingType: z.enum(["GOOGLE_MEET", "ZOOM", "IN_PERSON"]),
  MeetingMembers: z.enum(["ONE_ON_ONE", "GROUP", "ORGANIZATION"]),
  bookingVisibility: z.enum(BOOKING_VISIBILITIES),
  organizationId: z.string().cuid().nullable().optional(),
  requiredHostRole: z
    .enum(["OWNER", "TEACHER", "STUDENT"])
    .nullable()
    .optional(),
  requiredGuestRole: z
    .enum(["OWNER", "TEACHER", "STUDENT"])
    .nullable()
    .optional(),
});

export const schedulingSchema = baseSchedulingSchema
  .refine((data) => data.MeetingType !== "IN_PERSON" || !!data.location, {
    message: "Location is required for in-person meetings",
    path: ["location"],
  })
  .refine((data) => data.MeetingMembers !== "GROUP" || !!data.max_members, {
    message: "Field max members is required",
    path: ["max_members"],
  })
  .refine(
    (data) =>
      data.bookingVisibility !== "ORGANIZATION" || !!data.organizationId,
    {
      message: "Choose an organization for organization-only booking",
      path: ["organizationId"],
    },
  )
  .refine(
    (data) => data.MeetingMembers !== "ORGANIZATION" || !!data.organizationId,
    {
      message: "Choose an organization for organization meetings",
      path: ["organizationId"],
    },
  )
  .refine(
    (data) =>
      data.MeetingMembers !== "ORGANIZATION" ||
      data.requiredHostRole === "TEACHER",
    {
      message: "Organization meetings must be hosted by a teacher",
      path: ["requiredHostRole"],
    },
  )
  .refine(
    (data) =>
      data.MeetingMembers !== "ORGANIZATION" ||
      data.requiredGuestRole === "STUDENT",
    {
      message: "Organization meetings must be booked by a student",
      path: ["requiredGuestRole"],
    },
  );

export const updateSchedulingSchema = baseSchedulingSchema.partial();
