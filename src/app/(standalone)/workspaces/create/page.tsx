import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";
import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";

export default async function CreateWorkspacePage() {
  const user = await getCurrent();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </div>
  );
}
