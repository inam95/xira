import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectSettingsClient } from "./client";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectSettingsPage({ params }: Props) {
  const user = getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const { projectId } = await params;

  return <ProjectSettingsClient projectId={projectId} />;
}
