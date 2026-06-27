"use client";

import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { toast } from "sonner";
import { resetPasswordSchema } from "@/schemas/auth.zod";
import { useSearchParams, useRouter } from "next/navigation";
import PasswordInput from "@/components/auth/password-input";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      return toast.error("Token is missing or invalid.");
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: data.password,
          confirmPassword: data.confirmPassword,
          token,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        return toast.error(result.error || "Something went wrong");
      }

      toast.success("Password has been reset successfully!");

      router.push("/sign-in");
    } catch (error) {
      toast.error("Error occurred while resetting password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>

                  <PasswordInput
                    {...field}
                    placeholder="Enter new password"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Confirm Password</FieldLabel>

                  <PasswordInput
                    {...field}
                    placeholder="Repeat password"
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
              {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
