import Calendar from "@/components/calendar/Calendar";
import { getMeetings } from "@/app/actions/meeting-queries";
import { getServerSession } from "@/lib/getServerSession";

export default async function CalendarPage() {
  const session = await getServerSession();

  if (!session) return <div>Not authenticated</div>;

  const userId = session.user.id;
  const meetings = (await getMeetings(userId)).filter(
    (meeting) =>
      meeting.status === "SCHEDULED" &&
      (meeting.organizerId === userId ||
        meeting.participants.some(
          (participant) =>
            participant.userId === userId && participant.status === "ACCEPTED",
        )),
  );

  return (
    <div className="px-6 py-3">
      <Calendar meetings={meetings} currentUserId={userId} />
    </div>
  );
}
