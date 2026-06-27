"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/getServerSession";

export type PluginKey = "GOOGLE_MEET" | "ZOOM";

export async function getUserPlugins(userId: string) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("PLUGIN_ACCESS_DENIED");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleAccount: true,
      zoomAccount: true,
    },
  });

  const plugins: string[] = [];

  if (user?.googleAccount) plugins.push("GOOGLE_MEET");
  if (user?.zoomAccount) plugins.push("ZOOM");

  return plugins;
}

export async function disconnectPlugin(
  userId: string,
  pluginKey: "GOOGLE_MEET" | "ZOOM",
) {
  if (!userId) throw new Error("INVALID_USER_ID");
  const session = await getServerSession();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("PLUGIN_ACCESS_DENIED");
  }

  if (pluginKey === "GOOGLE_MEET") {
    await prisma.googleAccount.deleteMany({ where: { userId } });
    return { disconnected: pluginKey };
  }

  await prisma.zoomAccount.deleteMany({ where: { userId } });
  return { disconnected: pluginKey };
}
