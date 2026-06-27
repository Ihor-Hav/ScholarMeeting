"use client";

import { useState, useEffect, useMemo } from "react";
import type { schedulingWithId, schedulingType } from "@/schemas/scheduling.shared";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "next-auth";
import type { ContactTypeProps } from "@/types/contact.types";
import { deleteSchedulingById } from "@/app/actions/scheduling";
import SchedulingList from "@/components/scheduling/SchedulingList";
import SheetSchedualing from "@/components/scheduling/SheetScheduling";
import type { SchedulingOrganizationOption } from "@/components/scheduling/fields/OrganizationRulesField";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrivateScheduleAccessDialog from "@/components/scheduling/PrivateScheduleAccessDialog";

type Mode = "create" | "edit";

type VisibilityFilter =
  | "all"
  | "public"
  | "organization"
  | "contacts"
  | "private";

type SchedulingWrapperProps = {
  session: Session;
  schedualsInput: schedulingWithId[];
  contacts: ContactTypeProps[];
  organizations: SchedulingOrganizationOption[];
};

const TAB_META: Record<
  VisibilityFilter,
  { title: string; description: string }
> = {
  all: {
    title: "All Scheduling",
    description: "Manage all your meeting schedules from one place.",
  },
  public: {
    title: "Public Scheduling",
    description: "Visible to anyone with access to your booking page.",
  },
  organization: {
    title: "Organization Scheduling",
    description: "Available only to members of your organization.",
  },
  contacts: {
    title: "Contacts Scheduling",
    description: "Available only to people from your contacts list.",
  },
  private: {
    title: "Private Scheduling",
    description: "Private schedules only visible to you.",
  },
};

export default function SchedulingWrapper({
  session,
  contacts,
  schedualsInput,
  organizations,
}: SchedulingWrapperProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [item, setItem] = useState<schedulingWithId | null>(null);
  const [accessItem, setAccessItem] = useState<schedulingWithId | null>(null);

  const [scheduals, setScheduals] =
    useState<schedulingWithId[]>(schedualsInput);

  const [tab, setTab] = useState<VisibilityFilter>("all");

  useEffect(() => {
    setScheduals(schedualsInput);
  }, [schedualsInput]);

  const handleEdit = (inputItem: schedulingWithId) => {
    setItem(inputItem);
    setMode("edit");
    setOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteSchedulingById(itemId);

      setScheduals((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Sucessfully deleted!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = () => {
    setItem(null);
    setMode("create");
    setOpen(true);
  };

  const handleFormSuccess = async (data?: schedulingWithId) => {
    if (!data) {
      setOpen(false);
      return;
    }

    if (mode === "create") {
      setScheduals((prev) => [data, ...prev]);
    } else if (mode === "edit") {
      setScheduals((prev) =>
        prev.map((item) => (item.id === data.id ? data : item)),
      );
    }

    setOpen(false);
  };

  const counts = useMemo(
    () => ({
      all: scheduals.length,
      public: scheduals.filter((s) => s.bookingVisibility === "PUBLIC").length,
      organization: scheduals.filter(
        (s) => s.bookingVisibility === "ORGANIZATION",
      ).length,
      contacts: scheduals.filter((s) => s.bookingVisibility === "CONTACTS")
        .length,
      private: scheduals.filter((s) => s.bookingVisibility === "PRIVATE")
        .length,
    }),
    [scheduals],
  );

  const filteredScheduals = useMemo(() => {
    switch (tab) {
      case "public":
        return scheduals.filter((item) => item.bookingVisibility === "PUBLIC");

      case "organization":
        return scheduals.filter(
          (item) => item.bookingVisibility === "ORGANIZATION",
        );

      case "contacts":
        return scheduals.filter(
          (item) => item.bookingVisibility === "CONTACTS",
        );

      case "private":
        return scheduals.filter((item) => item.bookingVisibility === "PRIVATE");

      default:
        return scheduals;
    }
  }, [scheduals, tab]);

  const meta = TAB_META[tab];

  return (
    <div>
      {open ? (
        <SheetSchedualing
          open={open}
          onOpenChange={setOpen}
          mode={mode}
          selectedItem={item}
          organizations={organizations}
        />
      ) : null}

      <PrivateScheduleAccessDialog
        scheduling={accessItem}
        ownerId={session.user.id}
        contacts={contacts}
        open={!!accessItem}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAccessItem(null);
        }}
      />

      <div className="flex items-start justify-between p-5 border-b">
        <div>
          <h1 className="text-2xl font-semibold">{meta.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta.description}
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as VisibilityFilter)}
      >
        <TabsList className="grid grid-cols-5 w-full rounded-none">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>

          <TabsTrigger value="public">Public ({counts.public})</TabsTrigger>

          <TabsTrigger value="organization">
            Organization ({counts.organization})
          </TabsTrigger>

          <TabsTrigger value="contacts">
            Contacts ({counts.contacts})
          </TabsTrigger>

          <TabsTrigger value="private">Private ({counts.private})</TabsTrigger>
        </TabsList>
      </Tabs>

      <SchedulingList
        organizerId={session.user.id}
        scheduals={filteredScheduals}
        contacts={contacts}
        canManage
        onEdit={handleEdit}
        onDelete={handleDelete}
        onManageAccess={setAccessItem}
      />
    </div>
  );
}
