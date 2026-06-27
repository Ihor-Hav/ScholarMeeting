"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError, FieldLabel } from "@/components/ui/field";
import type { OrganizationInviteOption } from "@/schemas/meeting.shared";

type Props<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  members: OrganizationInviteOption[];
  currentUserId: string;
  hostId: string;
};

export default function OrganizationParticipantsField<T extends FieldValues>({
  name,
  control,
  members,
  currentUserId,
  hostId,
}: Props<T>) {
  const inviteableMembers = members.filter(
    (member) =>
      member.user.id !== currentUserId && member.user.id !== hostId,
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedIds: string[] = field.value || [];
        const allSelected =
          inviteableMembers.length > 0 &&
          inviteableMembers.every((member) =>
            selectedIds.includes(member.user.id),
          );

        const toggleMember = (userId: string) => {
          field.onChange(
            selectedIds.includes(userId)
              ? selectedIds.filter((id) => id !== userId)
              : [...selectedIds, userId],
          );
        };

        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>Organization participants</FieldLabel>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={inviteableMembers.length === 0}
                onClick={() =>
                  field.onChange(
                    allSelected
                      ? []
                      : inviteableMembers.map((member) => member.user.id),
                  )
                }
              >
                {allSelected ? "Clear all" : "Invite entire group"}
              </Button>
            </div>

            <div className="max-h-52 space-y-1 overflow-y-auto">
              {inviteableMembers.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No other organization members found.
                </p>
              ) : (
                inviteableMembers.map((member) => {
                  const selected = selectedIds.includes(member.user.id);

                  return (
                    <Card
                      key={member.user.id}
                      className={`cursor-pointer py-2 transition ${
                        selected ? "border-blue-500/40 bg-blue-500/5" : ""
                      }`}
                      onClick={() => toggleMember(member.user.id)}
                    >
                      <CardContent className="flex items-center justify-between px-3">
                        <div>
                          <p className="text-sm font-medium">
                            {member.user.name} {member.user.lastname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{member.role}</Badge>
                          {selected ? <Check className="size-4" /> : null}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {fieldState.error ? (
              <FieldError>{fieldState.error.message}</FieldError>
            ) : null}
          </div>
        );
      }}
    />
  );
}
