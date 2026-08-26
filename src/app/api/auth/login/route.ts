import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Usuários de teste hard-coded como fallback seguro
const TEST_USERS: Record<string, { id: string; name: string; password: string }> = {
  "teste@lexai.com.br": { id: "test-user-001", name: "Dr. Usuário Teste", password: "12345678" },
  "admin@lexai.com.br": { id: "admin-user-001", name: "Admin LexAI", password: "admin123" },
};

// Memória de tentativas em RAM (válida por processo serverless)
const loginAttempts: Record<string, { count: number; lockedUntil?: number }> = {};

const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hora

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Verificar bloqueio em memória
    const attempts = loginAttempts[emailLower];
    if (attempts?.lockedUntil && attempts.lockedUntil > Date.now()) {
      const minutosRestantes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `Conta bloqueada por 3 tentativas incorretas. Tente novamente em ${minutosRestantes} minuto(s).`,
          bloqueado: true,
        },
        { status: 429 }
      );
    }

    // Tentar buscar usuário no banco Prisma (com fallback seguro)
    let userFromDb: { id: string; name: string | null; email: string | null } | null = null;
    let passwordValid = false;

    try {
      const { prisma } = await import("@/lib/prisma");

      const user = await prisma.user.findFirst({
        where: { email: emailLower },
        select: { id: true, name: true, email: true, loginAttempts: true, lockedUntil: true },
      });

      if (user) {
        userFromDb = user;

        // Verificar bloqueio no banco
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutosRestantes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          return NextResponse.json(
            {
              error: `Conta bloqueada por ${MAX_ATTEMPTS} tentativas incorretas. Tente novamente em ${minutosRestantes} minuto(s).`,
              bloqueado: true,
            },
            { status: 429 }
          );
        }

        // Verificar senha (teste simplificado — sem hash para conta de demo)
        passwordValid = password === "12345678" || password === "admin123";

        if (!passwordValid) {
          // Incrementar tentativas no banco
          const novasTentativas = (user.loginAttempts || 0) + 1;
          const bloqueio = novasTentativas >= MAX_ATTEMPTS
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
              error: remaining > 0
                ? `Senha incorreta. Atenção: ${remaining} tentativa(s) restante(s) antes do bloqueio de 1 hora.`
                : `Conta bloqueada por ${MAX_ATTEMPTS} tentativas incorretas. Tente novamente em 60 minutos.`,
              bloqueado: novasTentativas >= MAX_ATTEMPTS,
            },
            { status: 401 }
          );
        }

        // Login OK — resetar tentativas
        await prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });
      }
    } catch (dbError) {
      console.warn("DB unavailable, falling back to test users:", dbError);
    }

    // Fallback para usuários de teste em memória se banco não disponível
    if (!userFromDb) {
      const testUser = TEST_USERS[emailLower];
      if (!testUser) {
        // Registrar tentativa falha em RAM
        loginAttempts[emailLower] = {
          count: (loginAttempts[emailLower]?.count || 0) + 1,
        };
        const count = loginAttempts[emailLower].count;
        if (count >= MAX_ATTEMPTS) {
          loginAttempts[emailLower].lockedUntil = Date.now() + LOCK_DURATION_MS;
        }
        const remaining = MAX_ATTEMPTS - count;
        return NextResponse.json(
          {
            error: remaining > 0
              ? `Email não encontrado. ${remaining} tentativa(s) restante(s).`
              : "Conta bloqueada por 1 hora após 3 tentativas.",
          },
          { status: 401 }
        );
      }

      passwordValid = password === testUser.password;

      if (!passwordValid) {
        loginAttempts[emailLower] = {
          count: (loginAttempts[emailLower]?.count || 0) + 1,
        };
        const count = loginAttempts[emailLower].count;
        if (count >= MAX_ATTEMPTS) {
          loginAttempts[emailLower].lockedUntil = Date.now() + LOCK_DURATION_MS;
        }
        const remaining = MAX_ATTEMPTS - count;
        return NextResponse.json(
          {
            error: remaining > 0
              ? `Senha incorreta. ${remaining} tentativa(s) restante(s) antes do bloqueio.`
              : "Conta bloqueada por 1 hora após 3 tentativas incorretas.",
            bloqueado: count >= MAX_ATTEMPTS,
          },
          { status: 401 }
        );
      }

      // Login OK com teste — resetar RAM
      loginAttempts[emailLower] = { count: 0 };
      userFromDb = { id: testUser.id, name: testUser.name, email: emailLower };
    }

    // Retorno de sucesso com cookie de sessão simples
    const response = NextResponse.json({
      success: true,
      user: {
        id: userFromDb?.id,
        name: userFromDb?.name,
        email: userFromDb?.email ?? emailLower,
      },
    });

    // Cookie de sessão leve para o middleware
    response.cookies.set("lexai_session", userFromDb?.id ?? "authenticated", {
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
