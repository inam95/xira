"use server";

import {
  DATABASE_ID,
  MEMBERS_COLLECTION_ID,
  WORKSPACE_COLLECTION_ID,
} from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export async function getWorkspaces() {
  const { account, databases } = await createSessionClient();

  const user = await account.get();

  const members = await databases.listDocuments(
    DATABASE_ID,
    MEMBERS_COLLECTION_ID,
    [Query.equal("userId", user.$id)]
  );

  if (members.total === 0) {
    return { documents: [], total: 0 };
  }

  const workspaceIds = members.documents.map((member) => member.workspaceId);

  const workspaces = await databases.listDocuments(
    DATABASE_ID,
    WORKSPACE_COLLECTION_ID,
    [Query.contains("$id", workspaceIds), Query.orderAsc("$createdAt")]
  );

  return workspaces;
}
