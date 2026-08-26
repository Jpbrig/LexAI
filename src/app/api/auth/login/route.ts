import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hora

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    const { prisma } = await import("@/lib/prisma");

    // Buscar usuário no banco
    const user = await prisma.user.findFirst({
      where: { email: emailLower },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "E-mail não encontrado. Verifique o endereço ou cadastre-se." },
        { status: 401 }
      );
    }

    // Verificar bloqueio de conta
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutosRestantes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: `Conta bloqueada após ${MAX_ATTEMPTS} tentativas incorretas. Tente novamente em ${minutosRestantes} minuto(s).`,
          bloqueado: true,
        },
        { status: 429 }
      );
    }

    // Verificar se o usuário tem senha cadastrada
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "Esta conta usa login social (Google). Clique em 'Entrar com Google'.",
        },
        { status: 400 }
      );
    }

    // ✅ Comparar senha com hash bcrypt — SEGURO
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      const novasTentativas = (user.loginAttempts || 0) + 1;
      const bloqueio =
        novasTentativas >= MAX_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MS)
          : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: novasTentativas,
          ...(bloqueio ? { lockedUntil: bloqueio } : {}),
        },
      });

      const remaining = MAX_ATTEMPTS - novasTentativas;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Senha incorreta. ${remaining} tentativa(s) restante(s) antes do bloqueio de 1 hora.`
              : `Conta bloqueada por ${MAX_ATTEMPTS} tentativas incorretas. Tente em 60 minutos.`,
          bloqueado: novasTentativas >= MAX_ATTEMPTS,
        },
        { status: 401 }
      );
    }

    // ✅ Login bem-sucedido — resetar tentativas
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    // Cookie de sessão seguro
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set("lexai_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Erro crítico na rota de login:", error?.message ?? error);
    return NextResponse.json(
      { error: "Erro interno ao realizar login. Tente novamente." },
      { status: 500 }
    );
  }
}
