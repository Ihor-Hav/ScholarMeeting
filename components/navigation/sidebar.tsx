"use client";

import type { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Phone,
  Building2,
  TimerIcon,
  Blocks,
  CalendarSync,
} from "lucide-react";

const Sidebar = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();

  if (!session) {
    return null;
  }

  const NavItemsList = [
    {
      name: "Scheduling",
      href: "/scheduling",
      active: pathname === "/scheduling",
      icon: <CalendarSync className="w-4 h-4"></CalendarSync>,
    },
    {
      name: "Meetings",
      href: "/meetings",
      active: pathname === "/meetings",
      icon: <Phone className="w-4 h-4"></Phone>,
    },
    {
      name: "Availability",
      href: "/availability",
      active: pathname === "/availability",
      icon: <TimerIcon className="w-4 h-4"></TimerIcon>,
    },
    {
      name: "Contacts",
      href: "/contacts",
      active: pathname === "/contacts",
      icon: <Users className="w-4 h-4"></Users>,
    },
    {
      name: "Calendar",
      href: "/calendar",
      active: pathname === "/calendar",
      icon: <Calendar className="w-4 h-4"></Calendar>,
    },
    {
      name: "Organization",
      href: "/organization",
      active: pathname === "/organization",
      icon: <Building2 className="w-4 h-4"></Building2>,
    },
    {
      name: "Plugins",
      href: "/plugins",
      active: pathname === "/plugins",
      icon: <Blocks className="w-4 h-4"></Blocks>,
    },
  ];

  return (
    <div className="min-h-screen w-60 border-r border-slate-700/20 px-3 py-4">
      <nav className="flex flex-col gap-1 px-2">
        {NavItemsList.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            active={item.active}
            icon={item.icon}
          >
            {item.name}
          </NavItem>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

function NavItem({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
