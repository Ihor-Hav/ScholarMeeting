"use client";

import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import GoogleAuthButton from "./google-auth-button";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  googleText?: string;
  onGoogleClick?: () => void;
}

const AuthCard = ({
  title,
  description,
  children,
  googleText = "Continue with Google",
  onGoogleClick,
}: AuthCardProps) => {
  return (
    <div
      className={`
        w-full max-w-md rounded-2xl border
        bg-background p-8 shadow-lg
        transition-all hover:shadow-xl
      `}
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <GoogleAuthButton text={googleText} onClick={onGoogleClick || (() => {})} />

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      {children}
    </div>
  );
};

export default AuthCard;
