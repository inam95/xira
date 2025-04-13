import { client } from "@/lib/rpc";
import { queryOptions } from "@tanstack/react-query";

export const tasksQueries = {
  tasks: () => queryOptions({ queryKey: ["tasks"] as const }),

  list: () =>
    queryOptions({
      queryKey: [...tasksQueries.tasks().queryKey, "list"] as const,
    }),

  filteredList: (props: { workspaceId: string }) =>
    queryOptions({
      queryKey: [
        ...tasksQueries.tasks().queryKey,
        "filteredList",
        props,
      ] as const,
      queryFn: async () => {
        const response = await client.api.tasks["$get"]({ query: props });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        return await response.json();
      },
    }),
};
