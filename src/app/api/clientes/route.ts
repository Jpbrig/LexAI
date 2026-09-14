import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { getAuthContext, forbiddenResponse, unauthorizedResponse } from "@/lib/auth-guard";
import { clienteSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.CLIENTS_READ)) return forbiddenResponse();

    const clientes = await prisma.cliente.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        processos: {
          where: { workspaceId: context.workspaceId },
          select: { id: true },
        },
      },
    });

    return NextResponse.json(
      clientes.map((cliente) => ({
        ...cliente,
        processosCount: cliente.processos.length,
      })),
    );
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.CLIENTS_CREATE)) return forbiddenResponse();

    const parsed = clienteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados do cliente inválidos." }, { status: 400 });
    }

    const cliente = await prisma.cliente.create({
      data: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        ...parsed.data,
        cidade: parsed.data.cidade || "Não informada",
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro ao criar cliente." }, { status: 500 });
  }
}
