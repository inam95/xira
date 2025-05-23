"use client";

import { DataFilters } from "@/components/data-filters";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { TabsContent } from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader, PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { tasksQueries } from "../api/queries";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useTaskFilters } from "../hooks/use-task-filters";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DataKanban } from "./data-kanban";
import { TaskStatus } from "../types";
import { useCallback } from "react";
import { useBulkUpdateTasks } from "../api/mutations/use-bulk-update-tasks";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

type TaskViewSwitcherProps = {
  hideProjectFilter?: boolean;
};

export function TaskViewSwitcher({ hideProjectFilter }: TaskViewSwitcherProps) {
  const [{ projectId, status, assigneeId, search, dueDate }] = useTaskFilters();
  const [view, setView] = useQueryState<"table" | "kanban" | "calendar">(
    "task-view",
    {
      defaultValue: "table",
      parse: (value) => value as "table" | "kanban" | "calendar",
    }
  );

  const paramProjectId = useProjectId();

  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();
  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    ...tasksQueries.filteredList({
      workspaceId: workspaceId,
      projectId: paramProjectId ?? projectId,
      status,
      assigneeId,
      search,
      dueDate,
    }),
  });

  const { mutate: bulkUpdateTasks } = useBulkUpdateTasks();

  const handleKanbanChange = useCallback(
    (
      tasks: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[]
    ) => {
      bulkUpdateTasks({
        json: {
          tasks,
        },
      });
    },
    [bulkUpdateTasks]
  );

  return (
    <Tabs
      defaultValue={view}
      onValueChange={(val) => setView(val as "table" | "kanban" | "calendar")}
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger value="table" className="h-8 w-full lg:w-auto">
              Table
            </TabsTrigger>
            <TabsTrigger value="kanban" className="h-8 w-full lg:w-auto">
              Kanban
            </TabsTrigger>
            <TabsTrigger value="calendar" className="h-8 w-full lg:w-auto">
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button size="sm" className="w-full lg:w-auto" onClick={open}>
            <PlusIcon className="size-4 mr-2" />
            New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />
        {isTasksLoading ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col justify-around items-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={tasks?.data.documents ?? []} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban
                data={tasks?.data.documents ?? []}
                onChange={handleKanbanChange}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-full">
              <DataCalendar data={tasks?.data.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
}
