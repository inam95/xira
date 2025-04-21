import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdClient } from "./client";

type Props = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function WorkspacePage({ params }: Props) {
  const user = await getCurrent();

  if (!user) {
    return redirect("/sign-in");
  }

  const { workspaceId } = await params;

  return <WorkspaceIdClient workspaceId={workspaceId} />;
}
