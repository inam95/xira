import { Card, CardContent } from "@/components/ui/card";
import { memberQueries } from "@/features/members/api/queries";
import { projectsQueries } from "@/features/projects/api/queries";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { EditTaskForm } from "./edit-task-form";
import { tasksQueries } from "../api/queries";

type EditTaskFormWrapperProps = {
  taskId: string;
  onCancel: () => void;
};

export function EditTaskFormWrapper({
  taskId,
  onCancel,
}: EditTaskFormWrapperProps) {
  const workspaceId = useWorkspaceId();

  const { data: task, isLoading: isTaskLoading } = useQuery({
    ...tasksQueries.getById({ taskId }),
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    ...projectsQueries.listByWorkspace({
      workspaceId,
    }),
  });
  const { data: members, isLoading: isMembersLoading } = useQuery({
    ...memberQueries.listByWorkspaceId({
      workspaceId,
    }),
  });

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    image: project.image,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.$id,
    name: member.name,
  }));

  const isLoading = isProjectsLoading || isMembersLoading || isTaskLoading;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <EditTaskForm
      projectOptions={projectOptions ?? []}
      memberOptions={memberOptions ?? []}
      initialValues={task.data}
      onCancel={onCancel}
    />
  );
}
