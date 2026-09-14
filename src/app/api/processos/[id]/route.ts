import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, notFoundResponse, unauthorizedResponse } from "@/lib/auth-guard";
import { forbiddenResponse } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) return unauthorizedResponse();
    if (!hasPermission(authContext, PERMISSIONS.PROCESSES_READ)) return forbiddenResponse();

    const { id } = await context.params;
    const processo = await prisma.processo.findFirst({
      where: {
        id,
        workspaceId: authContext.workspaceId,
      },
      include: {
        movimentacoes: {
          orderBy: { data: "desc" },
        },
        alertas: {
          where: { workspaceId: authContext.workspaceId },
        },
      },
    });

    if (!processo) return notFoundResponse();
    return NextResponse.json(processo);
  } catch (error) {
    console.error("Erro ao buscar processo por ID:", error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do processo." }, { status: 500 });
  }
}
