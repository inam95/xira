import { z } from "zod";
import { TaskStatus } from "./types";

export const CreateTaskSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.nativeEnum(TaskStatus, {
    required_error: "Status is required",
  }),
  workspaceId: z.string(),
  projectId: z.string(),
  dueDate: z.coerce.date(),
  assigneeId: z.string(),
  description: z.string().optional(),
});

export const CreateTaskSchemaForForm = CreateTaskSchema.omit({
  workspaceId: true,
  projectId: true,
  assigneeId: true,
});
