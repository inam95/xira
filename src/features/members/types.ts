import { Models } from "node-appwrite";

export const MEMBER_ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type MemberRole = (typeof MEMBER_ROLES)[keyof typeof MEMBER_ROLES];

export type Member = Models.Document & {
  name: string;
  email: string;
  role: MemberRole;
  workspaceId: string;
  userId: string;
};
