"use client";

import { useState } from "react";

import SchedulingCard from "@/components/scheduling/SchedualingCard";
import MeetingDialog from "@/components/meetings/MeetingDialog";
import type { schedulingWithId } from "@/schemas/scheduling.shared";
import type { ContactTypeProps } from "@/types/contact.types";

type SchedulingTypeProps = {
  organizerId: string;
  contacts: ContactTypeProps[];
  scheduals: schedulingWithId[];
  canManage?: boolean;
  onEdit: (item: schedulingWithId) => void;
  onDelete: (itemId: string) => void;
  onManageAccess?: (item: schedulingWithId) => void;
};

export default function SchedulingList({
  scheduals,
  organizerId,
  contacts,
  canManage = true,
  onEdit,
  onDelete,
  onManageAccess,
}: SchedulingTypeProps) {
  const [bookingItem, setBookingItem] = useState<schedulingWithId | null>(null);

  return (
    <>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scheduals.length === 0 ? (
          <p className="text-muted-foreground">
            No schedulings yet. Create one 👆
          </p>
        ) : (
          scheduals.map((item) => (
            <SchedulingCard
              key={item.id}
              item={item}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
              onManageAccess={onManageAccess}
              onBook={setBookingItem}
            />
          ))
        )}
      </div>

      {bookingItem ? (
        <MeetingDialog
          organizerId={organizerId}
          scheduling={bookingItem}
          contacts={contacts}
          defaultOpen
          showTrigger={false}
          onOpenChange={(isOpen) => {
            if (!isOpen) setBookingItem(null);
          }}
        />
      ) : null}
    </>
  );
}
