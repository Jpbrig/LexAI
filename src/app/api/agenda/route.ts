import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed";

function getUserIdFromRequest(req: NextRequest): string | null {
  const sessionUserId =
    req.cookies.get("lexai_session")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionUserId || sessionUserId === "authenticated") return null;
  return sessionUserId;
}

export async function GET(req: NextRequest) {
  try {
    await seedDatabase();
    const userId = getUserIdFromRequest(req);
    let user;

    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: "teste@lexai.com.br" },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const eventos = await prisma.eventoAgenda.findMany({
      where: { userId: user.id },
      orderBy: { data: "asc" },
    });

    return NextResponse.json(eventos);
  } catch (error: any) {
    console.error("Erro ao buscar agenda:", error);
    return NextResponse.json({ error: "Erro ao buscar agenda" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await seedDatabase();
    const userId = getUserIdFromRequest(req);
    let user;

    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: "teste@lexai.com.br" },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const { titulo, tipo, data, hora, processo, cliente, prioridade } = body;

    if (!titulo || !data) {
      return NextResponse.json({ error: "Título e data são obrigatórios" }, { status: 400 });
    }

    const novoEvento = await prisma.eventoAgenda.create({
      data: {
        userId: user.id,
        titulo,
        tipo: tipo || "Prazo Processual",
        data,
        hora: hora || "17:00",
        processo: processo || "N/A",
        cliente: cliente || "Geral",
        prioridade: prioridade || "Alta",
        status: "Pendente",
      },
    });

    return NextResponse.json(novoEvento, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar evento na agenda:", error);
    return NextResponse.json({ error: "Erro ao criar evento na agenda" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do evento é obrigatório" }, { status: 400 });
    }

    const eventoAtualizado = await prisma.eventoAgenda.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(eventoAtualizado);
  } catch (error: any) {
    console.error("Erro ao atualizar evento na agenda:", error);
    return NextResponse.json({ error: "Erro ao atualizar evento" }, { status: 500 });
  }
}
