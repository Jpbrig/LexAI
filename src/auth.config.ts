import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "Lt0TfZEg9ZyGwzlP8Qe2r+Koc17O+RIPQe1C8G2hrgg=",
  providers: [],
} satisfies NextAuthConfig;


