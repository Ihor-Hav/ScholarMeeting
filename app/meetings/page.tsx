import MeetingWrapper from "@/components/meetings/MeetingWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMeetings } from "@/app/actions/meeting-queries";

export default async function MeetingPage() {
  const session = await getServerSession(authOptions);

  if (!session) return <div>Not authenticated</div>;
  const meetings = await getMeetings(session.user.id);

  return <MeetingWrapper session={session} meetings={meetings} />;
}
