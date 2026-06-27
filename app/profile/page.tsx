"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import {
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/schemas/profile.zod";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import UploadAvatarButton from "@/components/common/upload-avatar-button";

type ProfileFormValues = {
  name: string;
  lastname: string;
};

const Page = () => {
  const { data: session, status, update } = useSession();

  const [profile, setProfile] = useState<ProfileFormValues | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      lastname: "",
    },
  });

  useEffect(() => {
    if (!session?.user) return;

    const nextProfile = {
      name: session.user.name ?? "",
      lastname: session.user.lastname ?? "",
    };

    setProfile(nextProfile);
    form.reset(nextProfile);
  }, [session, form]);

  if (status === "loading" || !profile) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  async function onSubmit(data: ProfileFormValues) {
    try {
      if (!session?.user?.id) throw new Error("USER_ID_MISSING");

      await updateProfile(session.user.id, data.name, data.lastname);

      await update({
        name: data.name,
        lastname: data.lastname,
      });

      setProfile(data);
      form.reset(data);

      toast.success("Successfully updated profile");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : undefined;

      switch (message) {
        case "USER_ID_MISSING":
          toast.error("User not authenticated");
          break;
        default:
          toast.error("Could not update profile");
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <Avatar className="w-32 h-32">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>
                {profile.name[0]}
                {profile.lastname[0]}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              {session?.user.id ? <UploadAvatarButton /> : null}
              <p className="text-xs text-muted-foreground">
                JPG, PNG або GIF, less than 5MB
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <FieldLabel>First name</FieldLabel>
                    <Input {...field} />
                    {fieldState.error && (
                      <FieldDescription className="text-destructive text-xs">
                        {fieldState.error.message}
                      </FieldDescription>
                    )}
                  </div>
                )}
              />

              <Controller
                name="lastname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <FieldLabel>Last name</FieldLabel>
                    <Input {...field} />
                    {fieldState.error && (
                      <FieldDescription className="text-destructive text-xs">
                        {fieldState.error.message}
                      </FieldDescription>
                    )}
                  </div>
                )}
              />
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button type="submit">Save changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(profile)}
              >
                Cancel
              </Button>
            </div>
          </form>

          <div>
            <h3 className="text-lg font-medium mb-2">Invite token</h3>
            <div className="flex gap-2 max-w-md">
              <Input
                value={session?.user.invite_token ?? ""}
                readOnly
                className="bg-muted-foreground/15"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={async () => {
                  if (!session?.user.invite_token) return;
                  await navigator.clipboard.writeText(
                    session.user.invite_token,
                  );
                  toast.success("Invite token copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t">
          <p className="text-sm text-muted-foreground">
            Signed in as {session?.user.email}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
