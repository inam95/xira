import { useParams } from "next/navigation";

export function useInviteCode() {
  const params = useParams<{ inviteCode: string }>();
  const inviteCode = params.inviteCode;
  return inviteCode;
}
