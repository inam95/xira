import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { JoinWorkspaceClient } from "./client";

type JoinWorkspacePageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function JoinWorkspacePage({
  params,
}: JoinWorkspacePageProps) {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const { workspaceId } = await params;

  return <JoinWorkspaceClient workspaceId={workspaceId} />;
}
