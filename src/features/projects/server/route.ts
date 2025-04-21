import {
  DATABASE_ID,
  IMAGE_BUCKET_ID,
  PROJECTS_COLLECTION_ID,
  TASKS_COLLECTION_ID,
} from "@/config";
import { getMember } from "@/features/members/utils";
import { Project } from "@/features/projects/types";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { MEMBER_ROLES } from "@/features/members/types";
import { Task, TaskStatus } from "@/features/tasks/types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      const user = c.get("user");
      const databases = c.get("databases");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        [Query.equal("workspaceId", workspaceId), Query.orderDesc("$createdAt")]
      );

      return c.json({
        data: projects,
      });
    }
  )
  .get(
    "/:projectId",
    sessionMiddleware,
    zValidator("param", z.object({ projectId: z.string() })),
    async (c) => {
      const { projectId } = c.req.valid("param");
      const databases = c.get("databases");
      const user = c.get("user");

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId
      );

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: project.workspaceId,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({
        data: project,
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const storage = c.get("storage");
      const { name, image, workspaceId } = c.req.valid("form");

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if (!member) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
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

      const project = await databases.createDocument<Project>(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        ID.unique(),
        {
          name,
          image: uploadedImageUrl,
          workspaceId,
        }
      );

      return c.json({ data: project });
    }
  )
  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId
      );

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: existingProject.workspaceId,
      });

      if (!member) {
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

      const project = await databases.updateDocument<Project>(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId,
        { name, image: uploadedImageUrl }
      );

      return c.json({ data: project });
    }
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const { projectId } = c.req.param();

    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      projectId
    );

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId: existingProject.workspaceId,
    });

    if (!member || member.role !== MEMBER_ROLES.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: Delete all tasks in the project

    await databases.deleteDocument(
      DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      projectId
    );

    return c.json({ data: { $id: projectId } });
  })
  .get(
    "/:projectId/analytics",
    sessionMiddleware,
    zValidator("param", z.object({ projectId: z.string() })),
    async (c) => {
      const { projectId } = c.req.valid("param");
      const databases = c.get("databases");
      const user = c.get("user");

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_COLLECTION_ID,
        projectId
      );

      const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: project.workspaceId,
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
          Query.equal("projectId", projectId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        ]
      );

      const lastMonthTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("projectId", projectId),
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
          Query.equal("projectId", projectId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          Query.equal("assigneeId", member.$id),
        ]
      );

      const lastMonthAssignedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("projectId", projectId),
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
          Query.equal("projectId", projectId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          Query.notEqual("status", TaskStatus.DONE),
        ]
      );

      const lastMonthInCompleteTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("projectId", projectId),
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
          Query.equal("projectId", projectId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          Query.equal("status", TaskStatus.DONE),
        ]
      );

      const lastMonthCompletedTasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("projectId", projectId),
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
          Query.equal("projectId", projectId),
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
          Query.equal("projectId", projectId),
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
