"use client";

import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { projectsQueries } from "@/features/projects/api/queries";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  workspaceId: string;
  projectId: string;
};

export function ProjectIdClient({ workspaceId, projectId }: Props) {
  const { data: project, isLoading: isProjectLoading } = useQuery({
    ...projectsQueries.projectById({
      projectId,
    }),
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    ...projectsQueries.projectAnalytics({
      projectId,
    }),
  });

  const isLoading = isProjectLoading || isAnalyticsLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!project) {
    return <PageError message="Project not found" />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.image}
            className="size-8"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <div className="">
          <Button variant="secondary" size="sm" asChild>
            <Link
              href={`/workspaces/${workspaceId}/projects/${projectId}/settings`}
            >
              <PencilIcon className="size-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      {analytics ? <Analytics data={analytics} /> : null}
      <TaskViewSwitcher hideProjectFilter />
    </div>
  );
}
