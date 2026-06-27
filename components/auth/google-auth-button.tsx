"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function GoogleAuthButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <Button className="w-full flex gap-2" onClick={onClick} type="button">
      <Image src="/google-icon.svg" alt="Google" width={18} height={18} />
      {text}
    </Button>
  );
}
