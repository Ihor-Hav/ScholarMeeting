import {
  addOrganizationMember,
  createOrganization,
  getOrganizationsForUser,
  removeOrganizationMember,
} from "@/app/actions/organization";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getServerSession } from "next-auth";
import Link from "next/link";

type OrganizationMemberView = {
  id: string;
  userId: string;
  role: "OWNER" | "TEACHER" | "STUDENT";
  user: {
    id: string;
    name: string;
    lastname: string;
    email: string;
  };
};

type OrganizationView = {
  id: string;
  name: string;
  description: string | null;
  members: OrganizationMemberView[];
  _count: {
    events: number;
  };
};

export default async function Organization() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return <div>Not authenticated</div>;

  const organizations = await getOrganizationsForUser(session.user.id);

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-1 border-b pb-4">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <p className="text-sm text-muted-foreground">
          Add teachers and students through an organization so bookings are not
          just person-to-person. Scheduling can now require a teacher host and a
          student guest inside the same organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
          <CardDescription>
            The creator becomes OWNER and can add teachers or students by email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={createOrganization}
            className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
          >
            <input type="hidden" name="ownerId" value={session.user.id} />
            <div className="space-y-2">
              <Label htmlFor="organization-name">Name</Label>
              <Input
                id="organization-name"
                name="name"
                placeholder="Computer Science 101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization-description">Description</Label>
              <Input
                id="organization-description"
                name="description"
                placeholder="Optional description"
              />
            </div>
            <Button className="self-end" type="submit">
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {organizations.map((organization: OrganizationView) => {
          const myMembership = organization.members.find(
            (member: { userId: string }) => member.userId === session.user.id,
          );
          const canManage =
            myMembership && ["OWNER", "TEACHER"].includes(myMembership.role);
          const canRemoveMembers = myMembership?.role === "OWNER";
          const teachers = organization.members.filter(
            (member: { role: string }) =>
              ["OWNER", "TEACHER"].includes(member.role),
          );
          const students = organization.members.filter(
            (member: { role: string }) => member.role === "STUDENT",
          );

          return (
            <Card key={organization.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{organization.name}</CardTitle>
                    <CardDescription>
                      {organization.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{myMembership?.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Teachers</p>
                    <p className="text-2xl font-semibold">{teachers.length}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Students</p>
                    <p className="text-2xl font-semibold">{students.length}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Schedules</p>
                    <p className="text-2xl font-semibold">
                      {organization._count.events}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <form
                    action={addOrganizationMember}
                    className="grid gap-3 sm:grid-cols-[1fr_150px_auto]"
                  >
                    <input
                      type="hidden"
                      name="actorId"
                      value={session.user.id}
                    />
                    <input
                      type="hidden"
                      name="organizationId"
                      value={organization.id}
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="member@email.com"
                    />
                    <Select name="role" defaultValue="STUDENT">
                      <SelectTrigger>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit">Add</Button>
                  </form>
                )}

                <div className="space-y-2">
                  {organization.members.map((member: OrganizationMemberView) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                    >
                      <Link
                        href={`/profile/${member.user.id}`}
                        className="hover:underline"
                      >
                        {member.user.name} {member.user.lastname} ·{" "}
                        {member.user.email}
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            member.role === "STUDENT" ? "outline" : "secondary"
                          }
                        >
                          {member.role}
                        </Badge>
                        {member.userId !== session.user.id &&
                          ["OWNER", "TEACHER"].includes(member.role) && (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/profile/${member.user.id}`}>
                                View schedules
                              </Link>
                            </Button>
                          )}
                        {canRemoveMembers && member.role !== "OWNER" && (
                          <form action={removeOrganizationMember}>
                            <input
                              type="hidden"
                              name="actorId"
                              value={session.user.id}
                            />
                            <input
                              type="hidden"
                              name="organizationId"
                              value={organization.id}
                            />
                            <input
                              type="hidden"
                              name="memberId"
                              value={member.id}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              variant="destructive"
                            >
                              Remove
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
