"use client";

import { ContactTypeProps } from "@/types/contact.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  acceptContact,
  cancelConnection,
  deleteConnection,
  rejectConnection,
} from "@/app/actions/contacts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Props = {
  contact: ContactTypeProps;
  myUserId: string;
  onAcceptCallback?: (callbackContact: ContactTypeProps) => void;
  onDeleteCallback?: (callbackContact: ContactTypeProps) => void;
  onCancelCallback?: (callbackContact: ContactTypeProps) => void;
  onRejectCallback?: (callbackContact: ContactTypeProps) => void;
};

const Contact = ({
  contact,
  myUserId,
  onAcceptCallback,
  onDeleteCallback,
  onCancelCallback,
  onRejectCallback,
}: Props) => {
  const isSender = contact.requested_by_id === myUserId;

  const otherUser =
    contact.user1.id === myUserId ? contact.user2 : contact.user1;

  const acceptNewContact = async () => {
    try {
      const updatedContact = await acceptContact(contact.id);

      if (!updatedContact) throw Error("Can't find contact");

      onAcceptCallback?.(updatedContact);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteContactConnection = async () => {
    try {
      await deleteConnection(contact.id);
      onDeleteCallback?.(contact);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    }
  };

  const cancelContactConnection = async () => {
    try {
      await cancelConnection(contact.id);
      onCancelCallback?.(contact);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    }
  };

  const rejectContactConnection = async () => {
    try {
      await rejectConnection(contact.id);
      onRejectCallback?.(contact);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    }
  };

  const UserInfo = () => (
    <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{otherUser.name?.[0] ?? "U"}</AvatarFallback>
      </Avatar>

      <div className="leading-tight">
        <p className="font-medium">
          {otherUser.name} {otherUser.lastname}
        </p>

        {otherUser.email && (
          <p className="text-sm text-muted-foreground truncate max-w-45">
            {otherUser.email}
          </p>
        )}
      </div>
    </Link>
  );

  if (contact.status === "ACCEPTED") {
    return (
      <Card className="hover:bg-muted/50 transition">
        <CardContent className="flex items-center justify-between p-4">
          <UserInfo />

          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm">
              Message
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={deleteContactConnection}
                >
                  Delete contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contact.status === "PENDING") {
    if (isSender) {
      return (
        <Card className="hover:bg-muted/50 transition">
          <CardContent className="flex items-center justify-between p-4">
            <UserInfo />

            <Button variant="ghost" size="sm" onClick={cancelContactConnection}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="hover:bg-muted/50 transition">
        <CardContent className="flex items-center justify-between p-4">
          <UserInfo />

          <div className="flex gap-2">
            <Button size="sm" onClick={acceptNewContact}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={rejectContactConnection}
            >
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default Contact;
