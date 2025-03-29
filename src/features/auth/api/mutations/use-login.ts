import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { authQueries } from "../queries";
import { workspaceQueries } from "@/features/workspaces/api/queries";

type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      return response.json();
    },
    onSuccess: () => {
      router.refresh();
      queryClient.invalidateQueries({
        queryKey: authQueries.current().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueries.list().queryKey,
      });
    },
    onError: () => {
      toast.error("Failed to login");
    },
  });

  return mutation;
};
