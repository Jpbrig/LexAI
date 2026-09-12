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
  plano: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ESCRITORIO"]).optional(),
  status: z
    .enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "INCOMPLETE", "UNPAID"])
    .optional(),
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

  const { name, plano, status, action } = parsed.data;

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: { subscription: true },
  });

  if (!workspace) return notFoundResponse("Organização não encontrada.");

  const workspaceUpdateData: { name?: string; plano?: "FREE" | "STARTER" | "PROFESSIONAL" | "ESCRITORIO" } = {};

  if (name) workspaceUpdateData.name = name;
  if (plano) workspaceUpdateData.plano = plano;

  if (Object.keys(workspaceUpdateData).length > 0) {
    await prisma.workspace.update({
      where: { id },
      data: workspaceUpdateData,
    });
  }

  const legacyActionStatusMap: Record<string, "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "UNPAID"> = {
    ACTIVATE: "ACTIVE",
    SUSPEND: "PAST_DUE",
    DEACTIVATE: "CANCELED",
  };

  const effectiveStatus = status || (action ? legacyActionStatusMap[action] : null);

  if (effectiveStatus) {
    if (!workspace.subscription) {
      return badRequestResponse("Este escritório não possui assinatura cadastrada para atualizar o status.");
    }

    await prisma.subscription.update({
      where: { workspaceId: id },
      data: { status: effectiveStatus },
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
    metadata: { action, name, plano, status: effectiveStatus },
  });

  return NextResponse.json({
    success: true,
    updated: {
      name,
      plano,
      status: effectiveStatus,
    },
  });
}
