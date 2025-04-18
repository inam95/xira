"use client";

import { useQuery } from "@tanstack/react-query";
import { tasksQueries } from "@/features/tasks/api/queries";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-breadcrumb";
import { DottedSeparator } from "@/components/dotted-separator";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { TaskDescription } from "@/features/tasks/components/task-description";

export function TaskIdClient({ taskId }: { taskId: string }) {
  const { data: task, isLoading: isTaskLoading } = useQuery({
    ...tasksQueries.getById({ taskId }),
  });

  if (isTaskLoading) {
    return <PageLoader />;
  }

  if (!task) {
    return <PageError message="Task not found" />;
  }

  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs project={task.data.project} task={task.data} />
      <DottedSeparator className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskOverview task={task.data} />
        <TaskDescription task={task.data} />
      </div>
    </div>
  );
}
