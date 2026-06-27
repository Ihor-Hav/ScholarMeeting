"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { findContact } from "@/app/actions/contacts";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ContactUser, ContactTypeProps } from "@/types/contact.types";
import { addContactRequest } from "@/app/actions/contacts";
import { toast } from "sonner";
import Link from "next/link";

const DialogContacts = ({
  invite_token,
  userId,
  onAddNewContactCallback,
}: {
  invite_token: string;
  userId: string | null;
  onAddNewContactCallback: (contact: ContactTypeProps) => void;
}) => {
  const [token, setToken] = useState("");
  const [contact, setContact] = useState<ContactUser | null>();

  async function findNewContact() {
    if (token.length !== 12 || token === invite_token) {
      return;
    }

    try {
      const newContact = await findContact(token);
      setContact(newContact);
    } catch (error) {
      console.error(error);
    }
  }

  async function addNewContact() {
    if (!contact || userId === null) {
      console.error(contact);
      console.error("User id: ", userId);
      return;
    }
    try {
      console.error("Contact ", contact);
      console.error("userId ", userId);
      const newContact = await addContactRequest(userId, contact.id);

      if (!newContact) throw Error("Couldn't establish somethign");

      onAddNewContactCallback(newContact);

      toast.success("Successfully sent contact request");
      setContact(null);
      setToken("");
    } catch (error) {
      toast.error(`${error}`);
      console.error(error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> Add
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find contact</DialogTitle>
          <DialogDescription>
            Enter an invitation token to find and add a new contact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FieldGroup>
            <Field>
              <Label htmlFor="invite_token">Invitation token</Label>
              <div className="flex gap-2">
                <Input
                  id="invite_token"
                  placeholder="e.g. AbC9xQ2KpL"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Button onClick={findNewContact}>Find</Button>
              </div>
            </Field>
          </FieldGroup>

          {contact && (
            <>
              <Separator />

              <Link href={`/profile/${contact.id}`} className="block">
                <Card className="border-muted my-0.5 py-0.5 cursor-pointer hover:bg-muted/50 transition">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>
                          {String(contact.name?.[0] ?? "U")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="leading-tight">
                        <p className="font-medium">
                          {String(contact.name + " " + contact.lastname).trim()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Potential contact
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // ❗ ключ
                        addNewContact();
                      }}
                    >
                      Add
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogContacts;
