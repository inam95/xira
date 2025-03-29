import { queryOptions } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const authQueries = {
  auth: () => queryOptions({ queryKey: ["auth"] as const }),

  current: () =>
    queryOptions({
      queryKey: [...authQueries.auth().queryKey, "current"],
      queryFn: async () => {
        console.log("fetching current user");
        const response = await client.api.auth.current["$get"]();
        if (!response.ok) {
          return null;
        }
        const { data } = await response.json();
        return data;
      },
    }),
};
