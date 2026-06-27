"use client";

import PluginCard from "@/components/plugins/plugin-card";
import { useEffect, useState } from "react";
import { disconnectPlugin, getUserPlugins } from "../actions/plugins";
import { useSession } from "next-auth/react";

const plugins = [
  {
    title: "Google Meet",
    description: "You need this plugin to create Google Meet links",
    icon: "/google-meet.svg",
    key: "GOOGLE_MEET" as const,
    oauthUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent`,
  },
  {
    title: "Zoom",
    description: "Connect your Zoom account to create meetings",
    icon: "/zoom.svg",
    key: "ZOOM",
    oauthUrl: `/api/zoom/oauth`,
  },
];

export default function Plugins() {
  const [pluginsInfo, setPluginsInfo] = useState<string[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPlugins = async () => {
      const userPlugins = await getUserPlugins(session.user.id);
      setPluginsInfo(userPlugins);
    };

    fetchPlugins();
  }, [session?.user?.id]);

  const handlePluginClick = async (
    key: string,
    oauthUrl: string,
    connected: boolean,
  ) => {
    if (!session?.user?.id) return;

    if (!connected) {
      window.location.assign(oauthUrl);
      return;
    }

    await disconnectPlugin(session.user.id, key as "GOOGLE_MEET" | "ZOOM");
    setPluginsInfo((current) => current.filter((plugin) => plugin !== key));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-5">
      {plugins.map((item, idx) => {
        const connected = pluginsInfo.includes(item.key);

        return (
          <PluginCard
            key={`${item.title}-${idx}`}
            title={item.title}
            description={item.description}
            icon={item.icon}
            connected={connected}
            callbackFunction={() =>
              handlePluginClick(item.key, item.oauthUrl, connected)
            }
            disconnectFunction={() =>
              handlePluginClick(item.key, item.oauthUrl, connected)
            }
          />
        );
      })}
    </div>
  );
}
