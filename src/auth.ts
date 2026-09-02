import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 60 * 60 * 1000;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

class AccountLockedError extends CredentialsSignin {
  code = "account-locked";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid-credentials";
}

async function ensurePersonalWorkspace(userId: string, name?: string | null) {
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "asc" },
    select: {
      workspaceId: true,
      role: true,
    },
  });

  if (membership) return membership;

  const workspaceName = name?.trim()
    ? `Escritório de ${name.trim()}`
    : "Meu escritório";

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        ownerId: userId,
      },
    });

    const createdMembership = await tx.membership.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: "OWNER",
        status: "ACTIVE",
      },
      select: {
        workspaceId: true,
        role: true,
      },
    });

    return createdMembership;
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "Lt0TfZEg9ZyGwzlP8Qe2r+Koc17O+RIPQe1C8G2hrgg=",
  session: {
    strategy: "jwt",
    maxAge: SESSION_DURATION_MS / 1000,
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "E-mail",
          type: "email",
          placeholder: "seu@email.com.br",
        },
        password: {
          label: "Senha",
          type: "password",
          placeholder: "••••••••",
        },
      },
      async authorize(rawCredentials) {
        try {
          const parsed = credentialsSchema.safeParse(rawCredentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              passwordHash: true,
              loginAttempts: true,
              lockedUntil: true,
            },
          });

          if (!user || !user.passwordHash) return null;

          const now = new Date();
          if (user.lockedUntil && user.lockedUntil > now) {
            throw new AccountLockedError();
          }

          const passwordValid = await bcrypt.compare(password, user.passwordHash);
          if (!passwordValid) {
            const attempts = (user.loginAttempts ?? 0) + 1;
            const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS
              ? new Date(Date.now() + LOCK_DURATION_MS)
              : null;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: attempts,
                lockedUntil,
              },
            }).catch(() => null);

            return null;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
            },
          }).catch(() => null);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (err) {
          if (err instanceof CredentialsSignin) throw err;
          console.error("Erro na autorização do usuário:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        if (user && user.id) {
          const workspace = await ensurePersonalWorkspace(user.id, user.name);
          const appSession = await prisma.appSession.create({
            data: {
              userId: user.id,
              workspaceId: workspace.workspaceId,
              expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
            },
          }).catch(() => null);

          token.uid = user.id;
          token.sid = appSession?.id || user.id;
          token.workspaceId = workspace.workspaceId;
          token.role = workspace.role;
        }

        if (trigger === "update" && session?.workspaceId) {
          token.workspaceId = session.workspaceId;
        }
      } catch (err) {
        console.error("Erro na callback JWT:", err);
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.uid || !token.sid || !token.workspaceId) {
        return session;
      }

      if (session.user) {
        session.user.id = String(token.uid);
      }
      session.sessionId = String(token.sid);
      session.workspaceId = String(token.workspaceId);
      session.role = token.role as NonNullable<typeof session.role>;
      return session;
    },
    // O Proxy aplica redirecionamentos/401 por tipo de rota; não deixar o
    // comportamento padrão do Auth.js transformar APIs em redirects HTML.
    authorized() {
      return true;
    },
  },
  events: {
    async signOut(message) {
      if (!("token" in message) || !message.token?.sid) return;

      await prisma.appSession.updateMany({
        where: {
          id: String(message.token.sid),
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    },
  },
});
