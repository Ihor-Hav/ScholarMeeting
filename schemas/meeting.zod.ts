import { z } from "zod";
export type {
  MeetingFormValues,
  MeetingWithFullOrganizer,
  SlotType,
} from "@/schemas/meeting.shared";

export const slotSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  availabilityId: z.string().optional(),
});

export const meetingSchema = z
  .object({
    title: z.string().min(2),
    description: z.string().optional(),
    comment: z.string().trim().max(2000).optional(),
    date: z.date(),

    slot: slotSchema.optional(), // 👈 ВАЖЛИВО

    location: z.string().nullish().optional(),
    meetingType: z.enum(["GOOGLE_MEET", "ZOOM", "IN_PERSON"]),
    participants: z.array(z.cuid()).optional(),
    duration: z.number().int().min(5).max(24 * 60),
    meetingMembers: z.enum(["ONE_ON_ONE", "GROUP", "ORGANIZATION"]),
    addToGoogleCalendar: z.boolean().optional(),
  })
  .refine((data) => !!data.slot, {
    message: "Please select a time slot",
    path: ["slot"],
  })
  .refine((data) => !!data.slot?.startDate, {
    message: "Please select a time slot",
    path: ["slot"],
  })
  .refine((data) => data.meetingType !== "IN_PERSON" || !!data.location, {
    message: "Location is required for in-person meetings",
    path: ["location"],
  });
