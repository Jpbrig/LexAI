import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { createUserSchema, updateUserSchema } from "@/lib/validation";

function safeUser(user: {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  oab: string | null;
  plano: string;
  trialEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return user;
}

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        oab: true,
        plano: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return unauthorizedResponse();
    return NextResponse.json(safeUser(user));
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);
    return NextResponse.json({ error: "Erro ao carregar configurações." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados de perfil inválidos.", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword, ...profile } = parsed.data;
    const currentUser = await prisma.user.findUnique({
      where: { id: context.userId },
      select: { passwordHash: true },
    });

    if (!currentUser) return unauthorizedResponse();

    let passwordHash: string | undefined;
    if (newPassword) {
      if (!currentUser.passwordHash || !currentPassword) {
        return NextResponse.json({ error: "Senha atual inválida." }, { status: 400 });
      }

      const passwordMatches = await bcrypt.compare(currentPassword, currentUser.passwordHash);
      if (!passwordMatches) {
        return NextResponse.json({ error: "Senha atual inválida." }, { status: 400 });
      }

      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: context.userId },
      data: {
        ...profile,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        oab: true,
        plano: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (passwordHash) {
      await prisma.appSession.updateMany({
        where: { userId: context.userId, id: { not: context.sessionId }, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return NextResponse.json(safeUser(updatedUser));
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro ao atualizar dados." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados de cadastro inválidos.", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password, oab } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "Não foi possível concluir o cadastro com esses dados." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          oab: oab || null,
          plano: "FREE",
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          oab: true,
          plano: true,
          trialEndsAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `Escritório de ${name}`,
          ownerId: user.id,
        },
      });

      await tx.membership.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      return user;
    });

    return NextResponse.json(safeUser(newUser), { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }
}
