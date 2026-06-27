"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, LinkIcon, Users, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomeStats } from "@/app/actions/stats";

const statMeta = [
  { key: "upcomingMeetings", label: "Upcoming meetings", icon: CalendarDays },
  { key: "hostedEvents", label: "Scheduling pages", icon: Video },
  { key: "contacts", label: "Contacts", icon: Users },
  { key: "connectedPlugins", label: "Connected plugins", icon: LinkIcon },
] as const;

export default function AuthenticatedHome() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Record<(typeof statMeta)[number]["key"], number>>({
    upcomingMeetings: 0,
    hostedEvents: 0,
    contacts: 0,
    connectedPlugins: 0,
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    getHomeStats(session.user.id).then(setStats).catch(console.error);
  }, [session?.user?.id]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return (
    <main className="space-y-6 px-4 py-6">
      <section>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-semibold">{session.user?.email}</h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statMeta.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats[key]}</div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
