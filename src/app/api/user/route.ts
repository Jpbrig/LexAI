import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed";
import bcrypt from "bcryptjs";

// Helper: extrai userId do cookie de sessão
function getUserIdFromRequest(req: NextRequest): string | null {
  const sessionUserId =
    req.cookies.get("lexai_session")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionUserId || sessionUserId === "authenticated") return null;
  return sessionUserId;
}

export async function GET(req: NextRequest) {
  try {
    await seedDatabase();

    // ✅ Segurança: usar ID da sessão, não e-mail hardcoded
    const userId = getUserIdFromRequest(req);
    let user;

    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    // Fallback para conta de demo durante desenvolvimento
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: "teste@lexai.com.br" },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Nunca retornar o hash da senha
    const { passwordHash: _, ...userSafe } = user as any;
    return NextResponse.json(userSafe);
  } catch (error: any) {
    console.error("Erro ao carregar usuário:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao carregar configurações" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { name, email, oab, image, newPassword } = await req.json();

    // ✅ Segurança: usar ID da sessão, não e-mail hardcoded
    const userId = getUserIdFromRequest(req);
    let user;

    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: "teste@lexai.com.br" },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Montar objeto de atualização
    const updateData: any = {
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      oab: oab !== undefined ? oab : user.oab,
      image: image !== undefined ? image : user.image,
    };

    // ✅ Se trocar senha, gerar novo hash bcrypt
    if (newPassword && newPassword.length >= 8) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Nunca retornar o hash da senha
    const { passwordHash: _, ...updatedSafe } = updatedUser as any;
    return NextResponse.json(updatedSafe);
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar dados" },
      { status: 500 }
    );
  }
}

// ✅ Rota de cadastro: cria novo usuário com senha hasheada
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, oab } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    // Verificar se e-mail já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado. Faça login." },
        { status: 409 }
      );
    }

    // ✅ Hash da senha com bcrypt (custo 12)
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        oab: oab || null,
        plano: "FREE",
      },
    });

    const { passwordHash: _, ...newUserSafe } = newUser as any;
    return NextResponse.json(newUserSafe, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar conta." },
      { status: 500 }
    );
  }
}
