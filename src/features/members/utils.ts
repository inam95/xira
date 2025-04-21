import { DATABASE_ID, MEMBERS_COLLECTION_ID } from "@/config";
import { Query, type Databases } from "node-appwrite";

type GetMemberProps = {
  databases: Databases;
  userId: string;
  workspaceId: string;
};

export const getMember = async ({
  databases,
  userId,
  workspaceId,
}: GetMemberProps) => {
  const member = await databases.listDocuments(
    DATABASE_ID,
    MEMBERS_COLLECTION_ID,
    [Query.equal("userId", userId), Query.equal("workspaceId", workspaceId)]
  );

  return member.documents[0];
};
