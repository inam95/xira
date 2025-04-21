import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { tasksQueries } from "../queries";
import { workspaceQueries } from "@/features/workspaces/api/queries";
import { projectsQueries } from "@/features/projects/api/queries";

type ResponseType = InferResponseType<(typeof client.api.tasks)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.tasks)["$post"]>;

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task created");
      queryClient.invalidateQueries({
        queryKey: tasksQueries.list().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: projectsQueries.projectAnalytics({
          projectId: data.projectId,
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueries.workspaceAnalytics({
          workspaceId: data.workspaceId,
        }).queryKey,
      });
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  return mutation;
};
