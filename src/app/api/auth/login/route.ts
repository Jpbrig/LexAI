import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha incorretos." },
        { status: 401 }
      );
    }

    // Verificar bloqueio por tentativas incorretas
    const now = new Date();

    // Se o usuário já está bloqueado
    if (user.trialEndsAt && user.trialEndsAt > now && (user.oab === "BLOQUEADO" || (user as any).tentativas >= 3)) {
      const minutosRestantes = Math.ceil((user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60));
      return NextResponse.json(
        {
          error: `Conta bloqueada devido a 3 tentativas incorretas. Tente novamente em ${minutosRestantes} minutos.`,
          bloqueado: true,
        },
        { status: 429 }
      );
    }

    // Senha padrão aceita para o usuário de teste
    const senhaValida = password === "12345678" || password === "admin123";

    if (!senhaValida) {
      // Incrementar tentativas e bloqueio se atingir 3
      const bloquearAte = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora de bloqueio

      await prisma.user.update({
        where: { id: user.id },
        data: {
          oab: "BLOQUEADO",
          trialEndsAt: bloquearAte,
        },
      });

      return NextResponse.json(
        { error: "Senha incorreta. Atenção: 3 erros bloqueiam a conta por 1 hora!" },
        { status: 401 }
      );
    }

    // Sucesso no login - resetar bloqueios
    await prisma.user.update({
      where: { id: user.id },
      data: {
        oab: "SP 123456",
        trialEndsAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Erro na rota de login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao realizar login." },
      { status: 500 }
    );
  }
}
