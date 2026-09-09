/**
 * GET  /api/admin/organizations   — lista todos os Workspaces (Tenants)
 * POST /api/admin/organizations   — cria um novo Tenant
 *
 * Acesso restrito a PLATFORM_ADMIN.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPlatformAdminContext,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth-guard";
import { logAuditAction } from "@/lib/audit";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().trim().min(2),
  ownerName: z.string().trim().min(2),
  ownerEmail: z.string().trim().email(),
});

export async function GET() {
  const admin = await getPlatformAdminContext();
  if (!admin) return forbiddenResponse("Acesso restrito a administradores da plataforma.");

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, email: true, platformRole: true } },
      _count: {
        select: {
          memberships: true,
          processos: true,
          clientes: true,
        },
      },
      subscription: {
        select: { plan: true, status: true, currentPeriodEnd: true },
      },
    },
  });

  const result = workspaces.map((w) => ({
    id: w.id,
    name: w.name,
    plano: w.plano,
    status: "ACTIVE", // Futuramente: campo status no Workspace
    ownerName: w.owner.name,
    ownerEmail: w.owner.email,
    membersCount: w._count.memberships,
    processosCount: w._count.processos,
    clientesCount: w._count.clientes,
    subscription: w.subscription,
    createdAt: w.createdAt,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const admin = await getPlatformAdminContext();
  if (!admin) return forbiddenResponse("Acesso restrito a administradores da plataforma.");

  const body = await req.json().catch(() => ({}));
  const parsed = createOrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, ownerName, ownerEmail } = parsed.data;

  // Verificar se o usuário proprietário já existe
  let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  const isNewUser = !owner;

  const result = await prisma.$transaction(async (tx) => {
    // Cria o usuário owner se não existir
    if (!owner) {
      owner = await tx.user.create({
        data: { name: ownerName, email: ownerEmail, plano: "FREE" },
      });
    }

    // Cria o Workspace (Tenant)
    const workspace = await tx.workspace.create({
      data: { name, ownerId: owner!.id },
    });

    // Cria o membership de OWNER
    await tx.membership.create({
      data: {
        workspaceId: workspace.id,
        userId: owner!.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    return workspace;
  });

  await logAuditAction({
    action: "WORKSPACE_CREATED",
    resource: "Workspace",
    resourceId: result.id,
    userId: admin.userId,
    metadata: {
      createdByPlatformAdmin: true,
      ownerEmail,
      isNewUser,
      workspaceName: name,
    },
  });

  return NextResponse.json(
    { success: true, workspaceId: result.id },
    { status: 201 }
  );
}
