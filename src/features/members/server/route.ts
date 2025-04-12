import { Hono } from "hono";
import { DATABASE_ID, MEMBERS_COLLECTION_ID } from "@/config";
import { Query } from "node-appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createAdminClient } from "@/lib/appwrite";
import { getMember } from "../utils";
import { MEMBER_ROLES, Member } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        [Query.equal("workspaceId", workspaceId)]
      );

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );

      return c.json({
        data: { ...members, documents: populatedMembers },
      });
    }
  )
  .delete(
    "/:memberId",
    sessionMiddleware,
    zValidator(
      "param",
      z.object({
        memberId: z.string(),
      })
    ),
    async (c) => {
      const { memberId } = c.req.valid("param");
      const databases = c.get("databases");
      const user = c.get("user");

      const memberToDelete = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        memberId
      );

      console.log("memberToDelete", memberToDelete);

      const allMembers = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        [Query.equal("workspaceId", memberToDelete.workspaceId)]
      );

      console.log("allMembers", allMembers);

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: memberToDelete.workspaceId,
      });

      console.log("member", member);

      if (!member) {
        console.log("Unauthorized 1", member);
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (
        member.$id !== memberToDelete.$id &&
        member.role !== MEMBER_ROLES.ADMIN
      ) {
        console.log("Unauthorized 2", member);
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (allMembers.documents.length === 1) {
        console.log("Cannot delete the only member");
        return c.json({ error: "Cannot delete the only member" }, 400);
      }

      await databases.deleteDocument(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        memberId
      );

      return c.json({ data: { $id: memberId } });
    }
  )
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator(
      "param",
      z.object({
        memberId: z.string(),
      })
    ),
    zValidator(
      "json",
      z.object({
        role: z.nativeEnum(MEMBER_ROLES),
      })
    ),
    async (c) => {
      const { memberId } = c.req.valid("param");
      const databases = c.get("databases");
      const user = c.get("user");
      const { role } = c.req.valid("json");

      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        memberId
      );

      const allMembers = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)]
      );

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: memberToUpdate.workspaceId,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (member.role !== MEMBER_ROLES.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (allMembers.documents.length === 1) {
        return c.json({ error: "Cannot downgrade the only admin" }, 400);
      }

      await databases.updateDocument(
        DATABASE_ID,
        MEMBERS_COLLECTION_ID,
        memberId,
        {
          role,
        }
      );

      return c.json({ data: { $id: memberId } });
    }
  );

export default app;
