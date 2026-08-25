import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: NextRequest) {
  try {
    // Garante que o banco Supabase tem dados iniciais
    await seedDatabase();

    const user = await prisma.user.findFirst({
      where: { email: "teste@lexai.com.br" },
      include: {
        processos: {
          include: {
            movimentacoes: {
              orderBy: { data: "desc" },
            },
            alertas: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        alertas: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const totalProcessos = user.processos.length;
    const processosAtivos = user.processos.filter((p) => p.status === "ATIVO").length;
    const totalAlertas = user.alertas.filter((a) => a.ativo).length;

    // Coleta todas as movimentações dos processos
    const todasMovimentacoes = user.processos.flatMap((p) =>
      p.movimentacoes.map((m) => ({
        id: m.id,
        processoId: p.id,
        processo: p.numeroCnj,
        tribunal: p.tribunal,
        tipo: m.tipo,
        descricao: m.descricao,
        resumoIa: m.resumoIa,
        data: m.data,
        urgente: m.tipo === "Sentença" || m.tipo === "Acórdão",
      }))
    ).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        oab: user.oab,
        plano: user.plano,
      },
      stats: {
        totalProcessos,
        processosAtivos,
        movimentacoesHoje: todasMovimentacoes.length,
        totalAlertas,
      },
      processos: user.processos,
      recentMovimentacoes: todasMovimentacoes,
    });
  } catch (error: any) {
    console.error("Erro na API do dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao carregar dados do banco" },
      { status: 500 }
    );
  }
}
