import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: {
        name: true,
        email: true,
        oab: true,
        plano: true,
        processos: {
          where: { workspaceId: context.workspaceId },
          include: {
            movimentacoes: {
              orderBy: { data: "desc" },
            },
            alertas: {
              where: { workspaceId: context.workspaceId },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
        alertas: {
          where: { workspaceId: context.workspaceId, ativo: true },
        },
      },
    });

    if (!user) return unauthorizedResponse();

    const todasMovimentacoes = user.processos
      .flatMap((processo) =>
        processo.movimentacoes.map((movimentacao) => ({
          id: movimentacao.id,
          processoId: processo.id,
          processo: processo.numeroCnj,
          tribunal: processo.tribunal,
          tipo: movimentacao.tipo,
          descricao: movimentacao.descricao,
          resumoIa: movimentacao.resumoIa,
          data: movimentacao.data,
          urgente: movimentacao.tipo === "Sentença" || movimentacao.tipo === "Acórdão",
        })),
      )
      .sort((a, b) => b.data.getTime() - a.data.getTime());

    return NextResponse.json({
      user,
      stats: {
        totalProcessos: user.processos.length,
        processosAtivos: user.processos.filter((processo) => processo.status === "ATIVO").length,
        movimentacoesHoje: todasMovimentacoes.filter((movimentacao) => movimentacao.data >= startOfToday).length,
        totalAlertas: user.alertas.length,
      },
      processos: user.processos,
      recentMovimentacoes: todasMovimentacoes,
    });
  } catch (error) {
    console.error("Erro na API do dashboard:", error);
    return NextResponse.json({ error: "Erro ao carregar dados do dashboard." }, { status: 500 });
  }
}
