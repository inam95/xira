"use client";

import { useLogout } from "@/features/auth/api/mutations/use-logout";
import { authQueries } from "@/features/auth/api/queries";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data, isLoading } = useQuery(authQueries.current());
  const { mutate: logout } = useLogout();

  useEffect(() => {
    if (!data && !isLoading) {
      router.push("/sign-in");
    }
  }, [data, isLoading, router]);

  return (
    <div>
      Authorized
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
