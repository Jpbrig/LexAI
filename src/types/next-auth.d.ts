import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    sessionId: string;
    workspaceId: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "READ_ONLY";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    sid?: string;
    workspaceId?: string;
    role?: "OWNER" | "ADMIN" | "MEMBER" | "READ_ONLY";
  }
}
