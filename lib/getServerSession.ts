import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getServerSession() {
  const session = await nextAuthGetServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session;
}
