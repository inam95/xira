"use client";

import { workspaceQueries } from "@/features/workspaces/api/queries";
import { RiAddCircleFill } from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const {
    data: workspaces,
    isError,
    isPending,
  } = useQuery({
    ...workspaceQueries.list(),
  });

  const onSelect = (value: string) => {
    router.push(`/workspaces/${value}`);
  };

  const hasWorkspaces =
    workspaces?.documents && workspaces.documents.length > 0;

  if (!isPending && isError) {
    return (
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase text-neutral-500">Workspaces</p>
          <RiAddCircleFill className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
        </div>
        <pre className="w-full p-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md text-wrap">
          Error loading workspaces. Please try again.
        </pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RiAddCircleFill className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
      </div>
      <Select disabled={isPending} onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue
              placeholder={
                hasWorkspaces ? "Select a workspace" : "No workspaces available"
              }
            />
          )}
        </SelectTrigger>
        <SelectContent>
          {hasWorkspaces ? (
            workspaces.documents.map((workspace) => (
              <SelectItem key={workspace.$id} value={workspace.$id}>
                <div className="flex justify-start items-center gap-3 font-medium w-full">
                  <WorkspaceAvatar
                    name={workspace.name}
                    image={workspace.image}
                  />
                  <span className="truncate flex-1">{workspace.name}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-workspaces" disabled>
              <div className="flex justify-start items-center gap-3 font-medium w-full">
                <p className="text-neutral-500">No workspaces available</p>
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
