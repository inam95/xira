"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { projectsQueries } from "@/features/projects/api/queries";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { useQuery } from "@tanstack/react-query";

type ProjectSettingsClientProps = {
  projectId: string;
};

export function ProjectSettingsClient({
  projectId,
}: ProjectSettingsClientProps) {
  const { data: project, isLoading } = useQuery({
    ...projectsQueries.projectById({
      projectId,
    }),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!project) {
    return <PageError message="Project not found" />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={project} />
    </div>
  );
}
