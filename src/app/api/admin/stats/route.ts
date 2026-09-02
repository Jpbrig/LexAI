import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL?.trim().toLowerCase();
    const isEnvAdmin = adminEmail && session.user.email?.trim().toLowerCase() === adminEmail;
    const isPlatformAdmin = isEnvAdmin || session.user.platformRole === "PLATFORM_ADMIN";

    if (!isPlatformAdmin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas o Admin Master tem permissão." },
        { status: 403 }
      );
    }

    // Fetch workspaces with details
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            oab: true,
            createdAt: true,
          },
        },
        memberships: {
          select: {
            id: true,
            role: true,
            status: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            processos: true,
            clientes: true,
            alertas: true,
          },
        },
        subscription: true,
      },
    });

    const totalUsers = await prisma.user.count();
    const totalProcessos = await prisma.processo.count();
    const totalClientes = await prisma.cliente.count();

    // Calculate approximate MRR
    let mrr = 0;
    workspaces.forEach((w) => {
      const plano = w.plano || w.subscription?.plan || "FREE";
      if (plano === "STARTER") mrr += 197;
      else if (plano === "PROFESSIONAL") mrr += 397;
      else if (plano === "ESCRITORIO") mrr += 797;
    });

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
