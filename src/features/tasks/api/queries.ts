import { client } from "@/lib/rpc";
import { queryOptions } from "@tanstack/react-query";
import { TaskStatus } from "../types";

type FilteredListProps = {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  search?: string | null;
};

export const tasksQueries = {
  tasks: () => queryOptions({ queryKey: ["tasks"] as const }),

  list: () =>
    queryOptions({
      queryKey: [...tasksQueries.tasks().queryKey, "list"] as const,
    }),

  filteredList: (props: FilteredListProps) =>
    queryOptions({
      queryKey: [
        ...tasksQueries.list().queryKey,
        "filteredList",
        props,
      ] as const,
      queryFn: async () => {
        const response = await client.api.tasks["$get"]({
          query: {
            workspaceId: props.workspaceId,
            projectId: props.projectId ?? undefined,
            status: props.status ?? undefined,
            assigneeId: props.assigneeId ?? undefined,
            dueDate: props.dueDate ?? undefined,
            search: props.search ?? undefined,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        return await response.json();
      },
    }),
};
