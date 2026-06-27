import SchedulingWrapper from "@/components/scheduling/SchedulingWrapper";
import { getServerSession } from "next-auth";
import { findContactsWithConnection } from "@/app/actions/contacts";
import { getSchedualings } from "@/app/actions/scheduling";
import { authOptions } from "@/lib/auth";
import { getOrganizationsForUser } from "@/app/actions/organization";

type OrganizationForScheduling = {
  id: string;
  name: string;
  members: {
    userId: string;
    role: "OWNER" | "TEACHER" | "STUDENT";
  }[];
};

export default async function SchedulingPage({
  searchParams,
}: {
  searchParams: Promise<{ search: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) return <div>Not authenticated</div>;

  const query = (await searchParams).search || "";

  const [contacts, scheduals, organizationRecords] = await Promise.all([
    findContactsWithConnection(session.user.id, query),
    getSchedualings(session.user.id),
    getOrganizationsForUser(session.user.id),
  ]);

  const organizations = organizationRecords.map(
    (organization: OrganizationForScheduling) => ({
      id: organization.id,
      name: organization.name,
      role:
        organization.members.find(
          (member: { userId: string }) => member.userId === session.user.id,
        )
          ?.role || "STUDENT",
    }),
  );

  return (
    <SchedulingWrapper
      session={session}
      contacts={contacts}
      schedualsInput={scheduals}
      organizations={organizations}
    />
  );
}
