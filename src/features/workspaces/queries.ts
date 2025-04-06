"use server";

import {
  DATABASE_ID,
  MEMBERS_COLLECTION_ID,
  WORKSPACE_COLLECTION_ID,
} from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { getMember } from "../members/utils";
import { Workspace } from "./types";

export async function getWorkspaces() {
  try {
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
  } catch {
    return { documents: [], total: 0 };
  }
}

type GetWorkspaceProps = {
  workspaceId: string;
};

export async function getWorkspace({ workspaceId }: GetWorkspaceProps) {
  try {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    const member = await getMember({
      userId: user.$id,
      workspaceId,
      databases,
    });

    if (!member) {
      return null;
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_COLLECTION_ID,
      workspaceId
    );

    return workspace;
  } catch {
    return null;
  }
}

type GetWorkspaceInfoProps = {
  workspaceId: string;
};

export async function getWorkspaceInfo({ workspaceId }: GetWorkspaceInfoProps) {
  try {
    const { databases } = await createSessionClient();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_COLLECTION_ID,
      workspaceId
    );

    return {
      name: workspace.name,
    };
  } catch {
    return null;
  }
}
