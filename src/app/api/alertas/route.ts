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

    const alertas = await prisma.alerta.findMany({
      where: { userId: user.id },
      include: {
        processo: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alertas);
  } catch (error: any) {
    console.error("Erro ao listar alertas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao carregar alertas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { processoId, tipo, canal } = await req.json();

    if (!processoId) {
      return NextResponse.json({ error: "processoId é obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: "teste@lexai.com.br" },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const novoAlerta = await prisma.alerta.create({
      data: {
        userId: user.id,
        processoId,
        tipo: tipo || "QUALQUER_MOVIMENTACAO",
        canal: canal || "EMAIL",
        ativo: true,
      },
      include: {
        processo: true,
      },
    });

    return NextResponse.json(novoAlerta, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar alerta:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar alerta" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ativo } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID do alerta é obrigatório" }, { status: 400 });
    }

    const alerta = await prisma.alerta.update({
      where: { id },
      data: { ativo },
    });

    return NextResponse.json(alerta);
  } catch (error: any) {
    console.error("Erro ao atualizar alerta:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar alerta" },
      { status: 500 }
    );
  }
}
