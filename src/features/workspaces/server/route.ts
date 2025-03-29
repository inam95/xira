import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import {
  IMAGE_BUCKET_ID,
  MEMBERS_COLLECTION_ID,
  WORKSPACE_COLLECTION_ID,
} from "@/config";
import { DATABASE_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MEMBER_ROLES } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_COLLECTION_ID,
      [Query.equal("userId", user.$id)]
    );

    if (members.total === 0) {
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_COLLECTION_ID,
      [Query.contains("$id", workspaceIds), Query.orderAsc("$createdAt")]
    );

    return c.json({ data: workspaces });
  })
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const storage = c.get("storage");
      const { name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const uploadedImage = await storage.createFile(
          IMAGE_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGE_BUCKET_ID,
          uploadedImage.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_COLLECTION_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          image: uploadedImageUrl,
          inviteCode: generateInviteCode(6),
        }
      );

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MEMBER_ROLES.ADMIN,
        }
      );

      return c.json({ data: workspace });
    }
  );

export default app;
