import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { getWorkspace } from "@/features/workspaces/queries";
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

  const initialValues = await getWorkspace({
    workspaceId,
  });

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
}
