"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";
import { usePathname } from "next/navigation";

const pathnameMap = {
  tasks: {
    title: "My Tasks",
    description: "View all of your tasks here",
  },
  projects: {
    title: "My Projects",
    description: "View all of your projects here",
  },
} as const;

const defaultMap = {
  title: "Home",
  description: "Monitor all of your projects and tasks here",
} as const;

export function Navbar() {
  const pathname = usePathname();
  const pathNameParts = pathname.split("/");
  const pathNameKey = pathNameParts[3];

  const { title, description } =
    pathnameMap[pathNameKey as keyof typeof pathnameMap] ?? defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-neutral-500">{description}</p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  );
}
