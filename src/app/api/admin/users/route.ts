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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        oab: true,
        plano: true,
        platformRole: true,
        lockedUntil: true,
        loginAttempts: true,
        createdAt: true,
        memberships: {
          select: {
            id: true,
            role: true,
            status: true,
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            processos: true,
            clientes: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Erro ao listar usuários admin:", err);
    return NextResponse.json(
      { error: "Erro ao buscar usuários do sistema." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const { userId, platformRole, plano, action } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
    }

    if (action === "lock") {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          lockedUntil: new Date("2100-01-01T00:00:00.000Z"),
        },
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === "unlock") {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { lockedUntil: null, loginAttempts: 0 },
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    const updateData: { platformRole?: "USER" | "PLATFORM_ADMIN"; plano?: "FREE" | "STARTER" | "PROFESSIONAL" | "ESCRITORIO" } = {};

    if (platformRole === "PLATFORM_ADMIN" || platformRole === "USER") {
      updateData.platformRole = platformRole;
    }

    if (["FREE", "STARTER", "PROFESSIONAL", "ESCRITORIO"].includes(plano)) {
      updateData.plano = plano;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar permissões do usuário." },
      { status: 500 }
    );
  }
}
