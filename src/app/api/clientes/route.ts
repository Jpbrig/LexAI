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

    const clientes = await prisma.cliente.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clientes);
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
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
    const { nome, tipo, documento, email, telefone, cidade, observacoes } = body;

    if (!nome || !documento) {
      return NextResponse.json({ error: "Nome e documento são obrigatórios" }, { status: 400 });
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        userId: user.id,
        nome,
        tipo: tipo || "PF",
        documento,
        email: email || "",
        telefone: telefone || "",
        cidade: cidade || "São Paulo",
        observacoes: observacoes || "",
      },
    });

    return NextResponse.json(novoCliente, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
