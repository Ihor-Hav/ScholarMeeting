"use client";

import { SignUpFormSchema } from "@/schemas/auth.zod";
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
import { SignUpInput } from "@/schemas/auth.zod";
import { signUp } from "@/app/actions/auth";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

const SignUp = () => {
  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: "",
      name: "",
      lastname: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: SignUpInput) => {
    const result = await signUp(formData);

    if (!result.ok) {
      if (result.error.fields) {
        Object.entries(result.error.fields).forEach(([field, message]) => {
          form.setError(field as keyof SignUpInput, {
            message: message[0],
          });
        });
      }

      toast.error(result.error.message);
      return;
    }

    signIn("credentials", { ...formData, callbackUrl: "/" });
  };

  return (
    <AuthCard
      title="Create an account"
      description="It takes less than a minute"
      googleText="Sign up with Google"
      onGoogleClick={() => signIn("google", { callbackUrl: "/" })}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel>Email</FieldLabel>

            <Input
              {...form.register("email")}
              placeholder="example@mail.com"
              aria-invalid={!!form.formState.errors.email}
            />

            {form.formState.errors.email && (
              <FieldDescription className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </FieldDescription>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field>
              <FieldLabel>First Name</FieldLabel>

              <Input
                {...form.register("name")}
                placeholder="Joe"
                aria-invalid={!!form.formState.errors.name}
              />

              {form.formState.errors.name && (
                <FieldDescription className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel>Last Name</FieldLabel>

              <Input
                {...form.register("lastname")}
                placeholder="Doe"
                aria-invalid={!!form.formState.errors.lastname}
              />

              {form.formState.errors.lastname && (
                <FieldDescription className="text-xs text-destructive">
                  {form.formState.errors.lastname.message}
                </FieldDescription>
              )}
            </Field>
          </div>

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Password</FieldLabel>
                <PasswordInput {...field} />
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
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Confirm password</FieldLabel>
                <PasswordInput {...field} />
                {fieldState.error && (
                  <FieldDescription className="text-xs text-destructive">
                    {fieldState.error.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
          </Button>
        </FieldGroup>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default SignUp;
