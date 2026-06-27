import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "./sidebar";

const SidebarServer = async () => {
  const session = await getServerSession(authOptions);
  return <Sidebar session={session} />;
};

export default SidebarServer;
