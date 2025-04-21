import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { workspaceQueries } from "../queries";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["$patch"]
>;

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.workspaces[":workspaceId"]["$patch"]({
        form,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Workspace updated");
      queryClient.invalidateQueries({
        queryKey: workspaceQueries.list().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueries.workspaceById({
          workspaceId: data.$id,
        }).queryKey,
      });
    },
    onError: () => {
      toast.error("Failed to update workspace");
    },
  });

  return mutation;
};
