"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  getPrivateScheduleAccess,
  setPrivateScheduleAccess,
} from "@/app/actions/scheduling";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { schedulingWithId } from "@/schemas/scheduling.shared";
import type { ContactTypeProps, ContactUser } from "@/types/contact.types";

type Props = {
  scheduling: schedulingWithId | null;
  ownerId: string;
  contacts: ContactTypeProps[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PrivateScheduleAccessDialog({
  scheduling,
  ownerId,
  contacts,
  open,
  onOpenChange,
}: Props) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [grantedUsers, setGrantedUsers] = useState<ContactUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const availableUsers = useMemo(() => {
    const users = new Map<string, ContactUser>();

    for (const user of grantedUsers) users.set(user.id, user);

    for (const contact of contacts) {
      if (contact.status !== "ACCEPTED") continue;
      const user = contact.user1Id === ownerId ? contact.user2 : contact.user1;
      if (user.id !== ownerId) users.set(user.id, user);
    }

    return [...users.values()].sort((first, second) =>
      `${first.name} ${first.lastname}`.localeCompare(
        `${second.name} ${second.lastname}`,
      ),
    );
  }, [contacts, grantedUsers, ownerId]);

  useEffect(() => {
    if (!open || !scheduling) return;
    let active = true;
    setLoading(true);

    getPrivateScheduleAccess(scheduling.id)
      .then((users) => {
        if (active) {
          setGrantedUsers(users);
          setSelectedUserIds(new Set(users.map((user) => user.id)));
        }
      })
      .catch(() => {
        if (active) toast.error("Could not load private access");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, scheduling]);

  const handleSave = async () => {
    if (!scheduling) return;
    setSaving(true);

    try {
      await setPrivateScheduleAccess(
        scheduling.id,
        [...selectedUserIds],
      );
      toast.success("Private access updated");
      onOpenChange(false);
    } catch {
      toast.error("Could not update private access");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Private schedule access</DialogTitle>
          <DialogDescription>
            Choose contacts who can see and book “{scheduling?.title}”.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-2 overflow-y-auto py-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : availableUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add and accept a contact before granting private access.
            </p>
          ) : (
            availableUsers.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border p-3"
              >
                <Checkbox
                  checked={selectedUserIds.has(user.id)}
                  onCheckedChange={(checked) => {
                    setSelectedUserIds((current) => {
                      const next = new Set(current);
                      if (checked) next.add(user.id);
                      else next.delete(user.id);
                      return next;
                    });
                  }}
                />
                <span className="text-sm">
                  {user.name} {user.lastname}
                  {user.email ? (
                    <span className="ml-2 text-muted-foreground">
                      {user.email}
                    </span>
                  ) : null}
                </span>
              </label>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={loading || saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
