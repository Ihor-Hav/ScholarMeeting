export type MeetingType = "GOOGLE_MEET" | "ZOOM" | "IN_PERSON";
export type MeetingMembers = "ONE_ON_ONE" | "GROUP" | "ORGANIZATION";
export type MeetingStatus = "SCHEDULED" | "CANCELLED";
export type ParticipantStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED";

export type SlotType = {
  startDate?: Date;
  endDate?: Date;
  availabilityId?: string;
};

export type OrganizationInviteOption = {
  role: "OWNER" | "TEACHER" | "STUDENT";
  user: {
    id: string;
    name: string;
    lastname: string;
    email: string;
  };
};

export type MeetingFormValues = {
  title: string;
  description?: string;
  comment?: string;
  date: Date;
  slot?: SlotType;
  location?: string | null;
  meetingType: MeetingType;
  participants?: string[];
  duration: number;
  meetingMembers: MeetingMembers;
  addToGoogleCalendar?: boolean;
};

export type MeetingWithFullOrganizer = {
  id: string;
  title: string;
  description: string | null;
  organizerId: string;
  eventId: string;
  startDate: Date;
  endDate: Date;
  status: MeetingStatus;
  meetingType: MeetingType;
  location: string | null;
  meetingLink: string | null;
  inviteToken: string;
  createdAt: Date;
  updatedAt: Date;
  organizer: {
    id: string;
    name: string;
    lastname: string;
    email: string;
  };
  participants: {
    id: string;
    userId: string;
    meetingId: string;
    status: ParticipantStatus;
    user: {
      id: string;
      name: string;
      lastname: string;
      email: string;
    };
  }[];
  comments: {
    id: string;
    body: string;
    authorId: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      lastname: string;
    };
  }[];
  event: {
    id: string;
    hostId: string;
    duration: number;
    meetingMembers: MeetingMembers;
  };
};
