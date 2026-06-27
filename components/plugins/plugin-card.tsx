"use client";

import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PluginCard({
  title,
  icon,
  description,
  connected,
  callbackFunction,
  disconnectFunction,
  disabled = false,
}: {
  title: string;
  description?: string;
  connected?: boolean;
  icon: string;
  callbackFunction?: () => void;
  disconnectFunction?: () => void;
  disabled?: boolean;
}) {
  return (
    <Card className="group relative max-w-xs w-full border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="flex flex-col items-center text-center p-6 gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center rounded-xl bg-primary/10 group-hover:scale-105 transition-transform duration-300">
          <Image
            src={icon}
            alt={`${title} icon`}
            fill
            className="object-contain p-2"
          />
        </div>

        <CardTitle className="text-lg font-semibold text-primary-foreground">
          {title}
        </CardTitle>

        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}

        <div className="text-xs">
          {connected ? (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              Connected
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
              Not connected
            </span>
          )}
        </div>

        <Button
          onClick={connected ? disconnectFunction : callbackFunction}
          disabled={disabled}
          className={`mt-2 w-full transition-colors duration-300 ${
            connected
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {connected ? "Disconnect" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}
