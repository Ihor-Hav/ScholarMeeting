"use client";

import { SignInFormSchema } from "@/schemas/auth.zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/auth/password-input";
import AuthCard from "@/components/auth/auth-card";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

const SignIn = () => {
  const form = useForm({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignInFormSchema>) => {
    const { email, password } = { ...data };

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
      redirect: false,
    });

    if (res?.error) {
      form.setError("root", {
        type: "manual",
        message: "Email or password is incorrect",
      });

      return;
    }

    redirect("/");
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account"
      googleText="Sign in with Google"
      onGoogleClick={() => signIn("google", { callbackUrl: "/" })}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...field}
                  placeholder="example@mail.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && (
                  <FieldDescription className="text-xs text-destructive">
                    {fieldState.error.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Password</FieldLabel>
                <PasswordInput {...field} aria-invalid={fieldState.invalid} />
                {fieldState.error && (
                  <FieldDescription className="text-xs text-destructive">
                    {fieldState.error.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
          {form.formState.errors.root && (
            <FieldDescription className="text-sm text-destructive text-center">
              {form.formState.errors.root.message}
            </FieldDescription>
          )}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </FieldGroup>

        <p className="text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-primary underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default SignIn;
