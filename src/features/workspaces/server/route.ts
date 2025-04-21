import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import {
  IMAGE_BUCKET_ID,
  MEMBERS_COLLECTION_ID,
  TASKS_COLLECTION_ID,
  WORKSPACE_COLLECTION_ID,
} from "@/config";
import { DATABASE_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MEMBER_ROLES } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { z } from "zod";
import { Workspace } from "../types";
import { endOfMonth, subMonths } from "date-fns";
import { startOfMonth } from "date-fns";
import { Task, TaskStatus } from "@/features/tasks/types";

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
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();
    const user = c.get("user");

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_COLLECTION_ID,
      workspaceId
    );

    return c.json({ data: workspace });
  })
  .get("/:workspaceId/info", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_COLLECTION_ID,
      workspaceId
    );

    return c.json({
      data: {
        $id: workspace.$id,
        name: workspace.name,
        image: workspace.image,
      },
    });
  })
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createWorkspaceSchema),
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
      } else {
        uploadedImageUrl = image;
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
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member || member.role !== MEMBER_ROLES.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

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
      } else {
        uploadedImageUrl = image;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACE_COLLECTION_ID,
        workspaceId,
        { name, image: uploadedImageUrl }
      );

      return c.json({ data: workspace });
    }
  )
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member || member.role !== MEMBER_ROLES.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: Delete all members in the workspace, projects, and tasks

    await databases.deleteDocument(
      DATABASE_ID,
      WORKSPACE_COLLECTION_ID,
      workspaceId
    );

    return c.json({ data: { $id: workspaceId } });
  })
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member || member.role !== MEMBER_ROLES.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workspace = await databases.updateDocument(
      DATABASE_ID,
      WORKSPACE_COLLECTION_ID,
      workspaceId,
      { inviteCode: generateInviteCode(6) }
    );

    return c.json({ data: workspace });
  })
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      try {
        const databases = c.get("databases");
        const user = c.get("user");

        const { workspaceId } = c.req.param();
        const { code } = c.req.valid("json");

        const member = await getMember({
          databases,
          userId: user.$id,
          workspaceId,
        });

        if (member) {
          return c.json({ error: "Already a member of this workspace" }, 400);
        }

        const workspace = await databases.getDocument<Workspace>(
          DATABASE_ID,
          WORKSPACE_COLLECTION_ID,
          workspaceId
        );

        if (workspace.inviteCode !== code) {
          return c.json({ error: "Invalid invite code" }, 401);
        }

        await databases.createDocument(
          DATABASE_ID,
          MEMBERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: user.$id,
            workspaceId,
            role: MEMBER_ROLES.MEMBER,
          }
        );

        return c.json({ data: workspace });
      } catch (error) {
        throw new Error("Failed to join workspace", { cause: error });
      }
    }
  )
  .get(
    "/:workspaceId/analytics",
    sessionMiddleware,
    zValidator("param", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const thisMonthTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]
      );

      const lastMonthTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]
      );

      const taskCount = thisMonthTasks.total;
      const taskDifference = taskCount - lastMonthTasks.total;

      const thisMonthAssignedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          Query.equal("assigneeId", member.$id),
        ]
      );

      const lastMonthAssignedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
          Query.equal("assigneeId", member.$id),
        ]
      );

      const assignedTaskCount = thisMonthAssignedTasks.total;
      const assignedTaskDifference =
        assignedTaskCount - lastMonthAssignedTasks.total;

      const thisMonthInCompleteTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          Query.notEqual("status", TaskStatus.DONE),
        ]
      );

      const lastMonthInCompleteTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
          Query.notEqual("status", TaskStatus.DONE),
        ]
      );

      const inCompleteTaskCount = thisMonthInCompleteTasks.total;
      const inCompleteTaskDifference =
        inCompleteTaskCount - lastMonthInCompleteTasks.total;

      const thisMonthCompletedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          Query.equal("status", TaskStatus.DONE),
        ]
      );

      const lastMonthCompletedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
          Query.equal("status", TaskStatus.DONE),
        ]
      );

      const completedTaskCount = thisMonthCompletedTasks.total;
      const completedTaskDifference =
        completedTaskCount - lastMonthCompletedTasks.total;

      const thisMonthOverDueTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]
      );

      const lastMonthOverDueTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        ]
      );

      const overDueTaskCount = thisMonthOverDueTasks.total;
      const overDueTaskDifference =
        overDueTaskCount - lastMonthOverDueTasks.total;

      return c.json({
        data: {
          taskCount,
          taskDifference,
          assignedTaskCount,
          assignedTaskDifference,
          inCompleteTaskCount,
          inCompleteTaskDifference,
          completedTaskCount,
          completedTaskDifference,
          overDueTaskCount,
          overDueTaskDifference,
        },
      });
    }
  );

export default app;
