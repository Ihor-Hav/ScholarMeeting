"use client";

import type { ReactNode } from "react";

import SchedulingList from "@/components/scheduling/SchedulingList";
import type { schedulingWithId } from "@/schemas/scheduling.shared";
import type { ContactTypeProps } from "@/types/contact.types";

type Props = {
  title: string;
  description?: string;
  organizerId: string;
  scheduals: schedulingWithId[];
  contacts: ContactTypeProps[];
  canManage?: boolean;
  actionSlot?: ReactNode;
  onEdit?: (item: schedulingWithId) => void;
  onDelete?: (itemId: string) => void;
};

export default function SchedulingSection({
  title,
  description,
  organizerId,
  scheduals,
  contacts,
  canManage = false,
  actionSlot,
  onEdit = () => {},
  onDelete = () => {},
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-700/20 px-4 py-5">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actionSlot}
      </div>

      <SchedulingList
        organizerId={organizerId}
        scheduals={scheduals}
        contacts={contacts}
        canManage={canManage}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
