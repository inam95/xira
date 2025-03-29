import { useParams } from "next/navigation";

export function useWorkspaceId() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  return workspaceId;
}
