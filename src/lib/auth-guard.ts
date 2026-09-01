import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "READ_ONLY";

export type AuthContext = {
  userId: string;
  workspaceId: string;
  sessionId: string;
  role: WorkspaceRole;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const sessionId = session?.sessionId;
  const workspaceId = session?.workspaceId;

  if (!userId || !sessionId || !workspaceId) return null;

  const activeSession = await prisma.appSession.findFirst({
    where: {
      id: sessionId,
      userId,
      workspaceId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
      user: {
        memberships: {
          some: {
            workspaceId,
            status: "ACTIVE",
          },
        },
      },
    },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
    },
  });

  if (!activeSession) return null;

  const membership = await prisma.membership.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: {
      role: true,
      status: true,
    },
  });

  if (!membership || membership.status !== "ACTIVE") return null;

  return {
    userId: activeSession.userId,
    workspaceId: activeSession.workspaceId,
    sessionId: activeSession.id,
    role: membership.role,
  };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Você não tem permissão para esta ação." }, { status: 403 });
}

export function notFoundResponse() {
  return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
}
