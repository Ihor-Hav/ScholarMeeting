"use client";
import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  placeholder?: string;
  id?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ className, placeholder, id, ...props }, ref) => {
    const [hidden, setHidden] = useState<boolean>(true);

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          className={cn("w-full", className)}
          id={id}
          type={hidden ? "password" : "text"}
          placeholder={placeholder}
        ></Input>
        {hidden ? (
          <Eye
            className="absolute right-5 top-1/2 translate-y-[-50%]"
            size={20}
            onClick={() => setHidden((prev) => !prev)}
          />
        ) : (
          <EyeOff
            className="absolute right-5 top-1/2 translate-y-[-50%]"
            size={20}
            onClick={() => setHidden((prev) => !prev)}
          />
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
