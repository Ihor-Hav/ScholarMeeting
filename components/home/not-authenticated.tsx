"use client";

import { useSession } from "next-auth/react";

const NotAuthenticated = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div className="py-4 px-4">Welcome back {session.user?.email}</div>;
};

export default NotAuthenticated;
