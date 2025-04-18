import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { TaskIdClient } from "./client";

type Props = {
  params: Promise<{
    workspaceId: string;
    taskId: string;
  }>;
};

export default async function TaskPage({ params }: Props) {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const { taskId } = await params;

  return <TaskIdClient taskId={taskId} />;
}
