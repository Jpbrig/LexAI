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

    const [totalProcessos, processosAtivos, movimentacoesHoje, totalAlertas, movimentacoesRecentes] = await Promise.all([
      prisma.processo.count({
        where: { workspaceId: context.workspaceId },
      }),
      prisma.processo.count({
        where: { workspaceId: context.workspaceId, status: "ATIVO" },
      }),
      prisma.movimentacao.count({
        where: {
          processo: { workspaceId: context.workspaceId },
          data: { gte: startOfToday },
        },
      }),
      prisma.alerta.count({
        where: { workspaceId: context.workspaceId, ativo: true },
      }),
      prisma.movimentacao.findMany({
        where: { processo: { workspaceId: context.workspaceId } },
        orderBy: { data: "desc" },
        take: 20,
        include: {
          processo: {
            select: { id: true, numeroCnj: true, tribunal: true },
          },
        },
      }),
    ]);

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: { name: true, email: true, oab: true, plano: true },
    });

    if (!user) return unauthorizedResponse();

    const formattedMovimentacoes = movimentacoesRecentes.map((mov) => ({
      id: mov.id,
      processoId: mov.processo.id,
      processo: mov.processo.numeroCnj,
      tribunal: mov.processo.tribunal,
      tipo: mov.tipo,
      descricao: mov.descricao,
      resumoIa: mov.resumoIa,
      data: mov.data,
      urgente: mov.tipo === "Sentença" || mov.tipo === "Acórdão",
    }));

    return NextResponse.json({
      user,
      stats: {
        totalProcessos,
        processosAtivos,
        movimentacoesHoje,
        totalAlertas,
      },
      recentMovimentacoes: formattedMovimentacoes,
    });
  } catch (error) {
    console.error("Erro na API do dashboard:", error);
    return NextResponse.json({ error: "Erro ao carregar dados do dashboard." }, { status: 500 });
  }
}
