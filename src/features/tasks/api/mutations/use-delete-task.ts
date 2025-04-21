import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { tasksQueries } from "../queries";
import { workspaceQueries } from "@/features/workspaces/api/queries";
import { projectsQueries } from "@/features/projects/api/queries";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[":taskId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$delete"]
>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task deleted");
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
      toast.error("Failed to delete task");
    },
  });

  return mutation;
};
