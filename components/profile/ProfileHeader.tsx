"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  acceptContact,
  addContactRequest,
  deleteConnection,
  cancelConnection,
  rejectConnection,
} from "@/app/actions/contacts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ContactStatus = "BLOCKED" | "PENDING" | "ACCEPTED";

type Props = {
  user: {
    id: string;
    name?: string;
    lastname?: string;
    email?: string;
  };
  contactStatus?: ContactStatus | null;
  isSender?: boolean;
  myUserId: string;
  connectionId: string;
};

const ProfileHeader = ({
  user,
  contactStatus = null,
  isSender,
  myUserId,
  connectionId,
}: Props) => {
  const router = useRouter();

  const handleAddContact = async () => {
    try {
      await addContactRequest(myUserId, user.id);
      router.refresh();
      toast.success("Friend request sent");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send request");
    }
  };

  const handleAccept = async () => {
    try {
      await acceptContact(user.id);
      router.refresh();
      toast.success("Contact accepted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConnection(connectionId);
      router.refresh();
      toast.success("Contact removed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove contact");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelConnection(connectionId);
      router.refresh();
      toast.success("Request cancelled");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel request");
    }
  };

  const handleReject = async () => {
    try {
      await rejectConnection(connectionId);
      router.refresh();
      toast.success("Request rejected");
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="w-full border-b bg-background">
      <div className="mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <h2 className="text-xl font-semibold">
              {user.name} {user.lastname}
            </h2>

            {user.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {contactStatus === "ACCEPTED" && (
            <>
              <Button size="sm">Message</Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                Remove
              </Button>
            </>
          )}

          {contactStatus === "PENDING" && isSender && (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel request
            </Button>
          )}

          {contactStatus === "PENDING" && !isSender && (
            <>
              <Button size="sm" onClick={handleAccept}>
                Accept
              </Button>
              <Button variant="outline" size="sm" onClick={handleReject}>
                Reject
              </Button>
            </>
          )}

          {contactStatus === null && (
            <Button size="sm" onClick={handleAddContact}>
              Add friend
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
