import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: NextRequest) {
  try {
    await seedDatabase();

    const user = await prisma.user.findFirst({
      where: { email: "teste@lexai.com.br" },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const processos = await prisma.processo.findMany({
      where: { userId: user.id },
      include: {
        movimentacoes: {
          orderBy: { data: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(processos);
  } catch (error: any) {
    console.error("Erro na API de processos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao listar processos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { numeroCnj, tribunal, classe, assunto, orgaoJulgador, notas } = await req.json();

    if (!numeroCnj || !tribunal) {
      return NextResponse.json(
        { error: "Número CNJ e Tribunal são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: "teste@lexai.com.br" },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const processo = await prisma.processo.create({
      data: {
        userId: user.id,
        numeroCnj,
        tribunal,
        classe: classe || "Ação Cível",
        assunto: assunto || "Direito Geral",
        orgaoJulgador: orgaoJulgador || "Vara Única",
        notas,
        status: "ATIVO",
        dataDistribuicao: new Date(),
        movimentacoes: {
          create: {
            data: new Date(),
            tipo: "Distribuição",
            descricao: `Processo ${numeroCnj} cadastrado com sucesso e integrado ao acompanhamento automático.`,
            resumoIa: "🏛️ PROCESSO CADASTRADO: Processo registrado no LexAI. Acompanhamento automático ativado.",
          },
        },
        alertas: {
          create: {
            userId: user.id,
            tipo: "QUALQUER_MOVIMENTACAO",
            canal: "EMAIL",
            ativo: true,
          },
        },
      },
      include: {
        movimentacoes: true,
      },
    });

    return NextResponse.json(processo, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao salvar processo:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao salvar processo no banco" },
      { status: 500 }
    );
  }
}
