"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "../api/mutations/use-logout";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "../api/queries";
import { Loader, LogOut } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";

export function UserButton() {
  const { data: user, isLoading } = useQuery({
    ...authQueries.current(),
  });
  const { mutate: logout } = useLogout();

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { name, email } = user;

  const avatarFallback =
    name.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="outline-none relative">
        <Avatar className="size-10 transition border border-neutral-300 hover:opacity-75">
          <AvatarFallback className="text-neutral-500 bg-neutral-200 font-medium flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="w-60"
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-[52px] border border-neutral-300">
            <AvatarFallback className="text-neutral-500 text-xl bg-neutral-200 font-medium flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center items-center">
            <p className="text-sm font-medium text-neutral-900">
              {name || "User"}
            </p>
            <p className="text-xs text-neutral-500">{email}</p>
          </div>
        </div>
        <DottedSeparator className="mb-1" />
        <DropdownMenuItem
          className="cursor-pointer h-10 flex justify-center text-amber-700 font-medium"
          onClick={() => logout()}
        >
          <LogOut className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
