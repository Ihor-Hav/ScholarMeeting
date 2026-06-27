import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function InviteToken({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const copyToken = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 transition-colors">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Invite Token</span>
        <span className="font-mono text-sm">{token}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 transition-all duration-200 ${
          copied ? "scale-110 text-green-600" : ""
        }`}
        onClick={copyToken}
      >
        {copied ? (
          <Check className="h-4 w-4 animate-in zoom-in duration-200" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
