import { getCurrent } from "@/features/auth/queries";
import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { redirect } from "next/navigation";

type JoinWorkspacePageProps = {
  params: Promise<{
    workspaceId: string;
    inviteCode: string;
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

  const workspaceInfo = await getWorkspaceInfo({ workspaceId });

  if (!workspaceInfo) {
    redirect("/");
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValues={workspaceInfo} />
    </div>
  );
}
