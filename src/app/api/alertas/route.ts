import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { getAuthContext, forbiddenResponse, notFoundResponse, unauthorizedResponse } from "@/lib/auth-guard";
import { alertaPatchSchema, alertaSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.PROCESSES_READ)) return forbiddenResponse();

    const alertas = await prisma.alerta.findMany({
      where: { workspaceId: context.workspaceId },
      include: { processo: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alertas);
  } catch (error) {
    console.error("Erro ao listar alertas:", error);
    return NextResponse.json({ error: "Erro ao listar alertas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.PROCESSES_UPDATE)) return forbiddenResponse();

    const parsed = alertaSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados do alerta inválidos." }, { status: 400 });
    }

    const processo = await prisma.processo.findFirst({
      where: { id: parsed.data.processoId, workspaceId: context.workspaceId },
      select: { id: true },
    });
    if (!processo) return notFoundResponse();

    const novoAlerta = await prisma.alerta.create({
      data: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        ...parsed.data,
      },
      include: { processo: true },
    });

    return NextResponse.json(novoAlerta, { status: 201 });
  } catch (error: unknown) {
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : null;
    if (errorCode === "P2002") {
      return NextResponse.json({ error: "Este alerta já existe para o processo." }, { status: 409 });
    }

    console.error("Erro ao criar alerta:", error);
    return NextResponse.json({ error: "Erro ao criar alerta." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.PROCESSES_UPDATE)) return forbiddenResponse();

    const parsed = alertaPatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados de atualização inválidos." }, { status: 400 });
    }

    const updated = await prisma.alerta.updateMany({
      where: {
        id: parsed.data.id,
        workspaceId: context.workspaceId,
      },
      data: { ativo: parsed.data.ativo },
    });

    if (updated.count === 0) return notFoundResponse();

    const alerta = await prisma.alerta.findFirst({
      where: { id: parsed.data.id, workspaceId: context.workspaceId },
      include: { processo: true },
    });
    return NextResponse.json(alerta);
  } catch (error) {
    console.error("Erro ao atualizar alerta:", error);
    return NextResponse.json({ error: "Erro ao atualizar alerta." }, { status: 500 });
  }
}
