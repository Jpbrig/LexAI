import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { getAuthContext, forbiddenResponse, notFoundResponse, unauthorizedResponse } from "@/lib/auth-guard";
import { agendaPatchSchema, agendaSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.CALENDAR_READ)) return forbiddenResponse();

    const eventos = await prisma.eventoAgenda.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: [{ data: "asc" }, { hora: "asc" }],
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Erro ao buscar agenda:", error);
    return NextResponse.json({ error: "Erro ao buscar agenda." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.CALENDAR_CREATE)) return forbiddenResponse();

    const parsed = agendaSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados do evento inválidos." }, { status: 400 });
    }

    const evento = await prisma.eventoAgenda.create({
      data: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        ...parsed.data,
      },
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar evento na agenda:", error);
    return NextResponse.json({ error: "Erro ao criar evento na agenda." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.CALENDAR_UPDATE)) return forbiddenResponse();

    const parsed = agendaPatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados de atualização inválidos." }, { status: 400 });
    }

    const updated = await prisma.eventoAgenda.updateMany({
      where: {
        id: parsed.data.id,
        workspaceId: context.workspaceId,
      },
      data: { status: parsed.data.status },
    });

    if (updated.count === 0) return notFoundResponse();

    const evento = await prisma.eventoAgenda.findFirst({
      where: { id: parsed.data.id, workspaceId: context.workspaceId },
    });
    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro ao atualizar evento na agenda:", error);
    return NextResponse.json({ error: "Erro ao atualizar evento." }, { status: 500 });
  }
}
