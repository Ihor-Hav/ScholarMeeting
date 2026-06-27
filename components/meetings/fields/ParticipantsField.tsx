"use client";

import { ContactTypeProps, ContactUser } from "@/types/contact.types";
import { Controller, Path, FieldValues, Control } from "react-hook-form";
import { FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import SearchInput from "../ui/SearchInput";

type ParticipantsFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  contacts: ContactTypeProps[];
  currentUserId: string;
};

function getContactUser(
  contact: ContactTypeProps,
  currentUserId: string,
): ContactUser {
  return contact.user1Id === currentUserId ? contact.user2 : contact.user1;
}

export default function ParticipantsField<T extends FieldValues>({
  contacts,
  currentUserId,
  name,
  label = "Participants",
  control,
}: ParticipantsFieldProps<T>) {
  const acceptedContacts = contacts.filter(
    (contact) => contact.status === "ACCEPTED",
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedIds: string[] = field.value || [];

        const toggleContacts = (contactUserId: string) => {
          if (selectedIds.includes(contactUserId)) {
            field.onChange(selectedIds.filter((id) => id !== contactUserId));
          } else {
            field.onChange([...selectedIds, contactUserId]);
          }
        };

        return (
          <>
            <FieldLabel>{label}</FieldLabel>

            <SearchInput />

            <div className="max-h-50 space-y-1 overflow-y-scroll">
              {acceptedContacts.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No accepted contacts found.
                </p>
              ) : (
                acceptedContacts.map((contact) => {
                  const contactUser = getContactUser(contact, currentUserId);
                  const isSelected = selectedIds.includes(contactUser.id);

                  return (
                    <Card
                      key={contact.id}
                      onClick={() => toggleContacts(contactUser.id)}
                      className={`cursor-pointer rounded-lg px-2 py-4 transition ${
                        isSelected ? "border-blue-500/20 bg-blue-50/10" : ""
                      }`}
                    >
                      <CardContent className="flex items-center justify-between">
                        <div className="leading-tight">
                          <p className="text-sm font-medium">
                            {contactUser.name} {contactUser.lastname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contactUser.email}
                          </p>
                        </div>
                        {isSelected && <Check />}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {fieldState.error && (
              <FieldError className="text-red-500">
                {fieldState.error.message}
              </FieldError>
            )}
          </>
        );
      }}
    />
  );
}
