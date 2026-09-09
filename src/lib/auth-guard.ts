import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Todos os papéis possíveis em um Workspace (Tenant)
export type WorkspaceRole =
  | "OWNER"
  | "ADMIN"
  | "LAWYER"
  | "INTERN"
  | "SECRETARY"
  // Legados — mantidos por retrocompatibilidade até a migration ser aplicada em prod
  | "MEMBER"
  | "READ_ONLY";

export type AuthContext = {
  userId: string;
  workspaceId: string;
  sessionId: string;
  role: WorkspaceRole;
  isPlatformAdmin: boolean;
};

/**
 * Obtém o contexto de autenticação completo para uso em routes de API.
 * Valida sessão ativa, membership e role no backend — nunca confia no
 * workspaceId ou role enviados pelo frontend.
 */
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

  const [membership, user] = await Promise.all([
    prisma.membership.findUnique({
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
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { platformRole: true },
    }),
  ]);

  if (!membership || membership.status !== "ACTIVE") return null;

  return {
    userId: activeSession.userId,
    workspaceId: activeSession.workspaceId,
    sessionId: activeSession.id,
    role: membership.role as WorkspaceRole,
    isPlatformAdmin: user?.platformRole === "PLATFORM_ADMIN",
  };
}

/**
 * Obtém contexto de Platform Admin — usado em rotas /api/admin/*.
 * Não exige workspace ativo; só valida que o usuário é PLATFORM_ADMIN.
 */
export async function getPlatformAdminContext(): Promise<{
  userId: string;
  isPlatformAdmin: true;
} | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { platformRole: true },
  });

  if (user?.platformRole !== "PLATFORM_ADMIN") return null;
  return { userId, isPlatformAdmin: true };
}

// ──────────────────────────────────────────────
// Helpers de Resposta
// ──────────────────────────────────────────────
export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
}

export function forbiddenResponse(msg?: string) {
  return NextResponse.json(
    { error: msg ?? "Você não tem permissão para esta ação." },
    { status: 403 }
  );
}

export function notFoundResponse(msg?: string) {
  return NextResponse.json(
    { error: msg ?? "Recurso não encontrado." },
    { status: 404 }
  );
}

export function badRequestResponse(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}
