import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Navbar from "../navigation/navbar";
import Sidebar from "../navigation/sidebar";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <Navbar session={session} />
      </header>
      {session ? (
        <div className="flex">
          <Sidebar session={session} />
          <main className="w-full">{children}</main>
        </div>
      ) : (
        <main>{children}</main>
      )}
      <Toaster />
    </div>
  );
};

export default MainLayout;
