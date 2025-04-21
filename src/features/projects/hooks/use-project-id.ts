"use client";

import { useParams } from "next/navigation";

export function useProjectId() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  return projectId;
}
