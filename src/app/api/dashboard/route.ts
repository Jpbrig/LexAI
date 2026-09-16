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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      user,
      totalProcessos,
      processosAtivos,
      movimentacoesHoje,
      totalAlertas,
      movimentacoesRecentes,
      appSession,
      processosSemana,
      movimentacoesSemana,
      alertasSemana,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: context.userId },
        select: { name: true, email: true, oab: true, plano: true },
      }),
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
        select: {
          id: true,
          tipo: true,
          descricao: true,
          resumoIa: true,
          data: true,
          processo: {
            select: { id: true, numeroCnj: true, tribunal: true },
          },
        },
      }),
      prisma.appSession.findUnique({
        where: { id: context.sessionId },
        select: { onboardingState: true },
      }),
      prisma.processo.findMany({
        where: { workspaceId: context.workspaceId, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.movimentacao.findMany({
        where: { processo: { workspaceId: context.workspaceId }, data: { gte: sevenDaysAgo } },
        select: { data: true },
      }),
      prisma.alerta.findMany({
        where: { workspaceId: context.workspaceId, ativo: true, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

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

    // Agregação dos últimos 7 dias 100% REAL do PostgreSQL
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weeklyPerformanceData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      const dayLabel = daysOfWeek[d.getDay()];

      const procCount = processosSemana.filter(
        (p) => new Date(p.createdAt).toISOString().split("T")[0] === dayStr
      ).length;
      const movCount = movimentacoesSemana.filter(
        (m) => new Date(m.data).toISOString().split("T")[0] === dayStr
      ).length;
      const alertCount = alertasSemana.filter(
        (a) => new Date(a.createdAt).toISOString().split("T")[0] === dayStr
      ).length;

      weeklyPerformanceData.push({
        day: dayLabel,
        processos: procCount,
        movimentacoes: movCount,
        alertas: alertCount,
      });
    }

    const onboardingState =
      typeof appSession?.onboardingState === "object" && appSession.onboardingState !== null
        ? (appSession.onboardingState as Record<string, boolean>)
        : {};

    return NextResponse.json({
      user,
      stats: {
        totalProcessos,
        processosAtivos,
        movimentacoesHoje,
        totalAlertas,
      },
      weeklyPerformanceData,
      onboardingState,
      recentMovimentacoes: formattedMovimentacoes,
    });
  } catch (error) {
    console.error("Erro na API do dashboard:", error);
    return NextResponse.json({ error: "Erro ao carregar dados do dashboard." }, { status: 500 });
  }
}
