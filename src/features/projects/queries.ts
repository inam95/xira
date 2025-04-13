import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "../members/utils";
import { Project } from "./types";
import { DATABASE_ID, PROJECTS_COLLECTION_ID } from "@/config";

type GetProjectProps = {
  projectId: string;
  workspaceId: string;
};

export async function getProject({ projectId, workspaceId }: GetProjectProps) {
  const { account, databases } = await createSessionClient();

  const user = await account.get();

  const member = await getMember({
    userId: user.$id,
    workspaceId,
    databases,
  });

  if (!member) {
    throw new Error("Unauthorized");
  }

  const project = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_COLLECTION_ID,
    projectId
  );

  return project;
}
