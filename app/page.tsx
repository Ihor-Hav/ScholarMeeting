"use client";

import Authenticated from "@/components/home/authenticated";
import NonAuthenticated from "@/components/home/not-authenticated";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <div>{session ? <Authenticated /> : <NonAuthenticated />}</div>;
}
