import { email, z } from "zod";

export const SignInFormSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const nameRegex = /^[\p{L}\s-]+$/u;

export const SignUpFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name is too long" })
      .regex(nameRegex, "Name can only contain letters, spaces, and hyphens")
      .trim(),

    lastname: z
      .string()
      .min(2, { message: "Lastname must be at least 2 characters" })
      .max(50, { message: "Lastname is too long" })
      .regex(
        nameRegex,
        "Lastname can only contain letters, spaces, and hyphens",
      )
      .trim(),

    email: z.email("Enter a valid email").toLowerCase().trim(),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password is too long" })
      .regex(/[A-Z]/, "Password must have at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must have at least 1 number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email").toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password is too long" })
      .regex(/[A-Z]/, "Password must have at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must have at least 1 number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignUpInput = z.infer<typeof SignUpFormSchema>;
