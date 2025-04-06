import { client } from "@/lib/rpc";
import { queryOptions } from "@tanstack/react-query";

export const memberQueries = {
  members: () => queryOptions({ queryKey: ["members"] as const }),

  list: () =>
    queryOptions({
      queryKey: [...memberQueries.members().queryKey, "list"],
    }),

  listByWorkspaceId: ({ workspaceId }: { workspaceId: string }) =>
    queryOptions({
      queryKey: [...memberQueries.members().queryKey, "list", workspaceId],
      queryFn: async () => {
        const response = await client.api.members["$get"]({
          query: { workspaceId },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }
        const { data } = await response.json();
        return data;
      },
    }),
};
