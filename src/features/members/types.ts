export const MEMBER_ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type MemberRole = (typeof MEMBER_ROLES)[keyof typeof MEMBER_ROLES];
