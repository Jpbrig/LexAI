import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      platformRole?: "USER" | "PLATFORM_ADMIN";
    } & DefaultSession["user"];
    sessionId: string;
    workspaceId: string;
    role: "OWNER" | "ADMIN" | "LAWYER" | "INTERN" | "SECRETARY" | "MEMBER" | "READ_ONLY";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    sid?: string;
    workspaceId?: string;
    role?: "OWNER" | "ADMIN" | "LAWYER" | "INTERN" | "SECRETARY" | "MEMBER" | "READ_ONLY";
    platformRole?: "USER" | "PLATFORM_ADMIN";
  }
}
