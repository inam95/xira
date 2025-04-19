"use client";

import { workspaceQueries } from "@/features/workspaces/api/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useQuery } from "@tanstack/react-query";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

type WorkspaceSettingsClientProps = {
  workspaceId: string;
};

export function WorkspaceSettingsClient({
  workspaceId,
}: WorkspaceSettingsClientProps) {
  const { data: workspace, isLoading } = useQuery({
    ...workspaceQueries.workspaceById({
      workspaceId,
    }),
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!workspace) {
    return <PageError message="Workspace not found" />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={workspace} />
    </div>
  );
}
