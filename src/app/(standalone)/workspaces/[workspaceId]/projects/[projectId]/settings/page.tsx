import { getCurrent } from "@/features/auth/queries";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { getProject } from "@/features/projects/queries";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
    workspaceId: string;
  }>;
};

export default async function ProjectSettingsPage({ params }: Props) {
  const user = getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const { projectId, workspaceId } = await params;

  const project = await getProject({ projectId, workspaceId });

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={project} />
    </div>
  );
}
