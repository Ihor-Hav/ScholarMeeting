export const BOOKING_VISIBILITIES = [
  "PUBLIC",
  "CONTACTS",
  "PRIVATE",
  "ORGANIZATION",
] as const;

export type BookingVisibility = (typeof BOOKING_VISIBILITIES)[number];
export type SchedulingMeetingType = "GOOGLE_MEET" | "ZOOM" | "IN_PERSON";
export type SchedulingMeetingMembers =
  | "ONE_ON_ONE"
  | "GROUP"
  | "ORGANIZATION";
export type SchedulingOrganizationRole = "OWNER" | "TEACHER" | "STUDENT";

export type schedulingType = {
  title: string;
  description?: string | null;
  week_days: number[];
  duration: number;
  location?: string | null;
  max_members: number | null;
  MeetingType: SchedulingMeetingType;
  MeetingMembers: SchedulingMeetingMembers;
  bookingVisibility: BookingVisibility;
  organizationId?: string | null;
  requiredHostRole?: SchedulingOrganizationRole | null;
  requiredGuestRole?: SchedulingOrganizationRole | null;
};

export type updateSchedulingType = Partial<schedulingType>;

export type schedulingWithId = schedulingType & {
  id: string;
  hostId: string;
  organization?: {
    id: string;
    name: string;
  } | null;
};
