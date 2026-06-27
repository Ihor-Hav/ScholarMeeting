import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "./navbar";

const NavbarServer = async () => {
  const session = await getServerSession(authOptions);
  return <Navbar session={session} />;
};

export default NavbarServer;
