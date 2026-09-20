import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { anamneseSchema } from "@/lib/validation";
import type { AreaDireito } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.CLIENTS_READ)) return forbiddenResponse();

    const anamneses = await prisma.anamneseCaso.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        cliente: {
          select: { id: true, nome: true, documento: true },
        },
      },
    });

    return NextResponse.json(anamneses);
  } catch (error) {
    console.error("Erro ao buscar anamneses:", error);
    return NextResponse.json({ error: "Erro ao buscar anamneses." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.CLIENTS_CREATE)) return forbiddenResponse();

    const body = await req.json();
    const parsed = anamneseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados da anamnese inválidos." }, { status: 400 });
    }

    const diagnosticoIaString = typeof body.diagnosticoIa === "string" ? body.diagnosticoIa : JSON.stringify(body.diagnosticoIa || {});

    const item = await prisma.anamneseCaso.create({
      data: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        tituloCaso: parsed.data.tituloCaso,
        areaDireito: parsed.data.areaDireito as AreaDireito,
        relatoFatos: parsed.data.relatoFatos,
        transcricaoAudio: parsed.data.transcricaoAudio,
        pedidosPretendidos: parsed.data.pedidosPretendidos,
        provasDisponiveis: parsed.data.provasDisponiveis,
        diagnosticoIa: diagnosticoIaString,
        clienteId: parsed.data.clienteId || null,
        status: "ANALISADO",
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar anamnese:", error);
    return NextResponse.json({ error: "Erro ao salvar anamnese de caso." }, { status: 500 });
  }
}
