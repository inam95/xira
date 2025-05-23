import { client } from "@/lib/rpc";
import { queryOptions } from "@tanstack/react-query";
import { InferResponseType } from "hono";

export const workspaceQueries = {
  workspace: () => queryOptions({ queryKey: ["workspace"] as const }),

  list: () =>
    queryOptions({
      queryKey: [...workspaceQueries.workspace().queryKey, "list"],
      queryFn: async () => {
        const response = await client.api.workspaces["$get"]();
        if (!response.ok) {
          throw new Error("Failed to fetch workspaces");
        }
        const { data } = await response.json();
        return data;
      },
    }),

  workspaceById: ({ workspaceId }: { workspaceId: string }) =>
    queryOptions({
      queryKey: [...workspaceQueries.workspace().queryKey, workspaceId],
      queryFn: async () => {
        const response = await client.api.workspaces[":workspaceId"]["$get"]({
          param: { workspaceId },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch workspace");
        }
        const { data } = await response.json();
        return data;
      },
    }),

  workspaceInfoById: ({ workspaceId }: { workspaceId: string }) =>
    queryOptions({
      queryKey: [...workspaceQueries.workspace().queryKey, workspaceId, "info"],
      queryFn: async () => {
        const response = await client.api.workspaces[":workspaceId"]["info"][
          "$get"
        ]({
          param: { workspaceId },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch workspace info");
        }
        const { data } = await response.json();
        return data;
      },
    }),

  workspaceAnalytics: ({ workspaceId }: { workspaceId: string }) =>
    queryOptions({
      queryKey: [
        ...workspaceQueries.workspace().queryKey,
        workspaceId,
        "analytics",
      ],
      queryFn: async () => {
        const response = await client.api.workspaces[":workspaceId"][
          "analytics"
        ]["$get"]({
          param: { workspaceId },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch workspace analytics");
        }
        const { data } = await response.json();
        return data;
      },
    }),
};

export type TWorkspaceAnalyticsResponse = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["analytics"]["$get"],
  200
>;
