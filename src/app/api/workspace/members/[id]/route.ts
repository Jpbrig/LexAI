import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { logAuditAction } from "@/lib/audit";
import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { sendWorkspaceInvite } from "@/lib/workspace-invitations";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    const { id: membershipId } = await params;

    // 1. Busca a membership atual
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
    }

    if (membership.workspaceId !== context.workspaceId) {
      return forbiddenResponse();
    }
    if (membership.status === "INVITED") {
      if (!hasPermission(context, PERMISSIONS.USERS_INVITE)) return forbiddenResponse();
    } else if (!hasPermission(context, PERMISSIONS.USERS_DELETE)) return forbiddenResponse();

    if (membership.userId === context.userId) {
      return NextResponse.json({ error: "Você não pode remover a si mesmo por esta interface." }, { status: 400 });
    }

    if (membership.role === "OWNER") {
      return NextResponse.json({ error: "Não é possível remover o titular do escritório." }, { status: 403 });
    }

    // 2. Remove o acesso
    await prisma.membership.delete({
      where: { id: membershipId },
    });

    // Revoga sessões ativas do usuário para este workspace
    await prisma.appSession.updateMany({
      where: {
        userId: membership.userId,
        workspaceId: context.workspaceId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await logAuditAction({
      action: "MEMBER_REMOVED",
      resource: "membership",
      resourceId: membership.id,
      context,
      metadata: { removedUserId: membership.userId },
    });

    return NextResponse.json({ success: true, message: "Membro removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json({ error: "Erro ao excluir membro." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.USERS_INVITE)) return forbiddenResponse();
    const { id } = await params;
    const membership = await prisma.membership.findFirst({
      where: { id, workspaceId: context.workspaceId, status: "INVITED" },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!membership?.user.email) return NextResponse.json({ error: "Convite pendente não encontrado." }, { status: 404 });

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.$executeRaw(Prisma.sql`UPDATE "Membership" SET "inviteTokenHash" = ${tokenHash}, "inviteExpiresAt" = ${expiresAt} WHERE id = ${membership.id}`);
    const inviteLink = `${new URL(req.url).origin}/auth/aceitar-convite?token=${token}`;
    const emailSent = await sendWorkspaceInvite({ workspaceId: context.workspaceId, email: membership.user.email, name: membership.user.name || "", inviteLink }).catch(() => false);
    await logAuditAction({ action: "MEMBER_INVITED", resource: "membership", resourceId: membership.id, context, metadata: { resent: true }, ipHash: req.headers.get("x-forwarded-for") || undefined });
    return NextResponse.json({ success: true, emailSent, inviteLink: emailSent ? undefined : inviteLink });
  } catch (error) {
    console.error("Erro ao reenviar convite:", error);
    return NextResponse.json({ error: "Não foi possível reenviar o convite." }, { status: 500 });
  }
}
