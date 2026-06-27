"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";

const ForgotPasswordSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
});

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: z.infer<typeof ForgotPasswordSchema>) => {
    try {
      const res = await fetch("/api/auth/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (e) {
      toast.error(`${e}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Confirm Email</CardTitle>
        </CardHeader>
        <CardContent className="min-w-100">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full max-w-sm"
          >
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>

                  <Input
                    {...field}
                    placeholder="example@mail.com"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Send Email
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-5">
            Back to sign in page?{" "}
            <Link href="/sign-in" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
