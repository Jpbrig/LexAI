import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const processo = await prisma.processo.findUnique({
      where: { id },
      include: {
        movimentacoes: {
          orderBy: { data: "desc" },
        },
        alertas: true,
      },
    });

    if (!processo) {
      const empenho = await prisma.processo.findFirst({
        include: {
          movimentacoes: { orderBy: { data: "desc" } },
          alertas: true,
        },
      });

      if (!empenho) {
        return NextResponse.json({ error: "Processo não encontrado" }, { status: 404 });
      }

      return NextResponse.json(empenho);
    }

    return NextResponse.json(processo);
  } catch (error: any) {
    console.error("Erro ao buscar processo por ID:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar detalhes do processo" },
      { status: 500 }
    );
  }
}
