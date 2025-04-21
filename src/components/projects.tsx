"use client";

import { projectsQueries } from "@/features/projects/api/queries";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
export function Projects() {
  const workspaceId = useWorkspaceId();
  const { open } = useCreateProjectModal();
  const pathname = usePathname();
  const { data } = useQuery({
    ...projectsQueries.listByWorkspace({ workspaceId }),
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      {data?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;
        return (
          <Link
            href={href}
            key={project.$id}
            className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-md cursor-pointer transition text-neutral-500 hover:opacity-75",
              isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
            )}
          >
            <ProjectAvatar name={project.name} image={project.image} />
            <span className="truncate">{project.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
