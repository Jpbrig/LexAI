import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformAdminContext, forbiddenResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const admin = await getPlatformAdminContext();
    if (!admin) return forbiddenResponse("Acesso restrito a administradores da plataforma.");

    const [workspaces, totalUsers, totalProcessos, totalClientes] =
      await Promise.all([
        prisma.workspace.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            owner: {
              select: { id: true, name: true, email: true, oab: true, createdAt: true },
            },
            memberships: {
              select: {
                id: true,
                role: true,
                status: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
            _count: { select: { processos: true, clientes: true, alertas: true } },
            subscription: true,
          },
        }),
        prisma.user.count(),
        prisma.processo.count(),
        prisma.cliente.count(),
      ]);

    // MRR estimado por plano
    let mrr = 0;
    for (const w of workspaces) {
      const plano = w.plano || w.subscription?.plan || "FREE";
      if (plano === "STARTER") mrr += 197;
      else if (plano === "PROFESSIONAL") mrr += 397;
      else if (plano === "ESCRITORIO") mrr += 797;
    }

    return NextResponse.json({
      totalWorkspaces: workspaces.length,
      totalUsers,
      totalProcessos,
      totalClientes,
      estimatedMrr: mrr,
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        plano: w.plano || w.subscription?.plan || "FREE",
        status: w.subscription?.status || "ACTIVE",
        ownerName: w.owner.name || "Sem Nome",
        ownerEmail: w.owner.email || "Sem Email",
        ownerOab: w.owner.oab || "Não informada",
        membersCount: w.memberships.length,
        processosCount: w._count.processos,
        clientesCount: w._count.clientes,
        createdAt: w.createdAt,
      })),
    });
  } catch (err) {
    console.error("Erro na API Admin Stats:", err);
    return NextResponse.json(
      { error: "Erro interno ao carregar estatísticas do admin." },
      { status: 500 }
    );
  }
}
