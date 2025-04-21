import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { WorkspaceSettingsClient } from "./client";
type WorkspaceSettingsPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const workspaceId = (await params).workspaceId;

  return <WorkspaceSettingsClient workspaceId={workspaceId} />;
}
