import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-guard";
import { canManageWorkspace } from "@/lib/authorization";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!canManageWorkspace(context)) return forbiddenResponse();

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

    return NextResponse.json({ success: true, message: "Membro removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json({ error: "Erro ao excluir membro." }, { status: 500 });
  }
}
