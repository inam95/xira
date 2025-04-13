"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useQuery } from "@tanstack/react-query";
import { tasksQueries } from "../api/queries";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";

export function TaskViewSwitcher() {
  const [view, setView] = useQueryState<"table" | "kanban" | "calendar">(
    "task-view",
    {
      defaultValue: "table",
      parse: (value) => value as "table" | "kanban" | "calendar",
    }
  );
  const { open } = useCreateTaskModal();
  const workspaceId = useWorkspaceId();
  const { data: tasks } = useQuery({
    ...tasksQueries.filteredList({
      workspaceId: workspaceId,
    }),
  });

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
        {/* Add Filters */}
        Filters
        <DottedSeparator className="my-4" />
        <>
          <TabsContent value="table">
            {JSON.stringify(tasks, null, 2)}
          </TabsContent>
          <TabsContent value="kanban">
            {JSON.stringify(tasks, null, 2)}
          </TabsContent>
          <TabsContent value="calendar">
            {JSON.stringify(tasks, null, 2)}
          </TabsContent>
        </>
      </div>
    </Tabs>
  );
}
