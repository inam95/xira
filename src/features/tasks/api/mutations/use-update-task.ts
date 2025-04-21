import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { tasksQueries } from "../queries";
import { projectsQueries } from "@/features/projects/api/queries";
import { workspaceQueries } from "@/features/workspaces/api/queries";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$patch"]
>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.tasks[":taskId"]["$patch"]({
        json,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task updated");
      queryClient.invalidateQueries({
        queryKey: tasksQueries.tasks().queryKey,
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
      toast.error("Failed to update task");
    },
  });

  return mutation;
};
