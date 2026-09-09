/**
 * GET    /api/admin/organizations/[id]   — detalhe de um Tenant
 * PATCH  /api/admin/organizations/[id]   — atualizar/suspender/ativar
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPlatformAdminContext,
  forbiddenResponse,
  notFoundResponse,
  badRequestResponse,
} from "@/lib/auth-guard";
import { logAuditAction } from "@/lib/audit";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().trim().min(2).optional(),
  action: z.enum(["ACTIVATE", "SUSPEND", "DEACTIVATE"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getPlatformAdminContext();
  if (!admin) return forbiddenResponse("Acesso restrito a administradores da plataforma.");

  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      memberships: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      subscription: true,
      _count: {
        select: { processos: true, clientes: true, auditLogs: true },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!workspace) return notFoundResponse("Organização não encontrada.");

  return NextResponse.json(workspace);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getPlatformAdminContext();
  if (!admin) return forbiddenResponse("Acesso restrito a administradores da plataforma.");

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateOrgSchema.safeParse(body);
  if (!parsed.success) return badRequestResponse("Dados inválidos.");

  const { name, action } = parsed.data;

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!workspace) return notFoundResponse("Organização não encontrada.");

  // Ações de status (suspend/activate/deactivate)
  // Por ora o modelo Workspace não tem campo `status` — registramos no AuditLog
  // e futuramente um campo poderá ser adicionado via migration incremental.

  if (name) {
    await prisma.workspace.update({
      where: { id },
      data: { name },
    });
  }

  const auditActionMap: Record<string, "WORKSPACE_SUSPENDED" | "WORKSPACE_ACTIVATED" | "WORKSPACE_UPDATED"> = {
    ACTIVATE: "WORKSPACE_ACTIVATED",
    SUSPEND: "WORKSPACE_SUSPENDED",
    DEACTIVATE: "WORKSPACE_SUSPENDED",
  };

  await logAuditAction({
    action: action ? auditActionMap[action] : "WORKSPACE_UPDATED",
    resource: "Workspace",
    resourceId: id,
    userId: admin.userId,
    metadata: { action, name },
  });

  return NextResponse.json({ success: true });
}
