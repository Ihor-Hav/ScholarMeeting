import SchedulingSection from "@/components/scheduling/SchedulingSection";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getEventAccessWhere } from "@/lib/scheduling-access";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function UserProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      lastname: true,
    },
  });

  if (!user) {
    return <div className="p-6">User not found.</div>;
  }

  const scheduals = await prisma.event.findMany({
    where: await getEventAccessWhere(session?.user?.id, userId),
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mappedScheduals = scheduals.map((event) => ({
    ...event,
    MeetingType: event.meetingType,
    MeetingMembers: event.meetingMembers,
  }));

  return (
    <SchedulingSection
      title={`${user.name} ${user.lastname}`}
      description="Available schedulings for booking"
      organizerId={session?.user.id || ""}
      scheduals={mappedScheduals}
      contacts={[]}
    />
  );
}
