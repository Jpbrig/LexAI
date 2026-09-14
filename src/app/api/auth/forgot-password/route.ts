import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { Resend } from "resend";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireServerSecret } from "@/lib/env";
import { getWorkspaceIntegrationValue } from "@/lib/integration-credentials";
import { getAuthContext } from "@/lib/auth-guard";
import { isRateLimited } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const neutralResponse = NextResponse.json({
    message: "Se existir uma conta com este e-mail, enviaremos instruções de recuperação.",
  });

  try {
    if (isRateLimited(req, "forgot-password", 5, 15 * 60 * 1000)) return neutralResponse;
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return neutralResponse;

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, name: true },
    });

    if (!user?.email) return neutralResponse;

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const authContext = await getAuthContext();
    const resendApiKey = await getWorkspaceIntegrationValue(authContext?.workspaceId, "RESEND", "RESEND_API_KEY") || requireServerSecret("RESEND_API_KEY");
    const emailFrom = process.env.EMAIL_FROM;
    if (!resendApiKey || !emailFrom) {
      console.error("Recuperação de senha indisponível: Resend não configurado.");
      return neutralResponse;
    }

    const baseUrl = process.env.AUTH_URL || new URL(req.url).origin;
    const resetUrl = `${baseUrl}/auth/reset-senha?token=${rawToken}`;
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: emailFrom,
      to: user.email,
      subject: "Redefina sua senha no LexAI",
      text: `Olá${user.name ? `, ${user.name}` : ""}. Use este link para redefinir sua senha: ${resetUrl}. O link expira em 30 minutos e pode ser usado uma única vez.`,
      html: `<p>Olá${user.name ? `, ${user.name}` : ""}.</p><p>Recebemos uma solicitação para redefinir sua senha no LexAI.</p><p><a href="${resetUrl}">Redefinir minha senha</a></p><p>Este link expira em 30 minutos e pode ser usado uma única vez.</p><p>Se você não solicitou esta alteração, ignore este e-mail.</p>`,
    });
  } catch (error) {
    console.error("Erro no fluxo de recuperação de senha:", error);
  }

  return neutralResponse;
}
