import { client } from "@/lib/rpc";
import { queryOptions } from "@tanstack/react-query";

export const projectsQueries = {
  projects: () => queryOptions({ queryKey: ["projects"] as const }),

  list: () =>
    queryOptions({
      queryKey: [...projectsQueries.projects().queryKey, "list"] as const,
    }),

  listByWorkspace: ({ workspaceId }: { workspaceId: string }) =>
    queryOptions({
      queryKey: [...projectsQueries.list().queryKey, workspaceId],
      queryFn: async () => {
        const response = await client.api.projects["$get"]({
          query: { workspaceId },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const { data } = await response.json();
        return data;
      },
    }),

  projectById: ({ projectId }: { projectId: string }) =>
    queryOptions({
      queryKey: [...projectsQueries.projects().queryKey, projectId],
      queryFn: async () => {
        const response = await client.api.projects[":projectId"]["$get"]({
          param: { projectId },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }

        const { data } = await response.json();
        return data;
      },
    }),
};
