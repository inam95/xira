"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { workspaceQueries } from "@/features/workspaces/api/queries";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useQuery } from "@tanstack/react-query";

type JoinWorkspaceClientProps = {
  workspaceId: string;
};

export function JoinWorkspaceClient({ workspaceId }: JoinWorkspaceClientProps) {
  const { data: workspace, isLoading } = useQuery({
    ...workspaceQueries.workspaceInfoById({
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
      <JoinWorkspaceForm initialValues={workspace} />
    </div>
  );
}
