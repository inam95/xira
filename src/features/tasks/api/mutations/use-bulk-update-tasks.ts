import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { tasksQueries } from "../queries";
import { projectsQueries } from "@/features/projects/api/queries";
import { workspaceQueries } from "@/features/workspaces/api/queries";

type ResponseType = InferResponseType<
  (typeof client.api.tasks)["bulk-update"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)["bulk-update"]["$post"]
>;

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks["bulk-update"]["$post"]({
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to update tasks");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task updated");
      queryClient.invalidateQueries({
        queryKey: tasksQueries.list().queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: projectsQueries.projectAnalytics({
          projectId: data[0].projectId,
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueries.workspaceAnalytics({
          workspaceId: data[0].workspaceId,
        }).queryKey,
      });
    },
    onError: () => {
      toast.error("Failed to update tasks");
    },
  });

  return mutation;
};
