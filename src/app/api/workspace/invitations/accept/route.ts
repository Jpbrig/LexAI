import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import { isRateLimited, requestFingerprint } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  password: z.string().min(8).max(128),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, "workspace-invite-accept", 8, 15 * 60_000)) return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Convite ou senha inválidos." }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
    const now = new Date();
    const rows = await prisma.$queryRaw<Array<{
      id: string; workspaceId: string; userId: string; status: string;
      inviteExpiresAt: Date | null; passwordHash: string | null;
    }>>(Prisma.sql`
      SELECT m.id, m."workspaceId", m."userId", m.status, m."inviteExpiresAt", u."passwordHash"
      FROM "Membership" m JOIN "User" u ON u.id = m."userId"
      WHERE m."inviteTokenHash" = ${tokenHash} LIMIT 1
    `);
    const membership = rows[0];

    if (!membership || membership.status !== "INVITED" || !membership.inviteExpiresAt || membership.inviteExpiresAt <= now) {
      return NextResponse.json({ error: "Este convite é inválido ou expirou." }, { status: 400 });
    }

    // Para uma conta já existente, a senha atual confirma que quem aceitou o
    // convite é o titular da conta; para contas pendentes, ela é criada aqui.
    if (membership.passwordHash) {
      const matches = await bcrypt.compare(parsed.data.password, membership.passwordHash);
      if (!matches) {
        return NextResponse.json({ error: "Informe a senha atual desta conta para aceitar o convite." }, { status: 400 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      if (!membership.passwordHash) {
        await tx.user.update({ where: { id: membership.userId }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), emailVerified: now } });
      } else {
        await tx.user.update({ where: { id: membership.userId }, data: { emailVerified: now } });
      }
      return tx.$executeRaw(Prisma.sql`
        UPDATE "Membership" SET status = 'ACTIVE', "inviteTokenHash" = NULL,
          "inviteExpiresAt" = NULL, "inviteAcceptedAt" = ${now}
        WHERE id = ${membership.id} AND status = 'INVITED' AND "inviteTokenHash" = ${tokenHash}
          AND "inviteExpiresAt" > ${now}
      `);
    });

    if (result !== 1) {
      return NextResponse.json({ error: "Este convite já foi utilizado ou expirou." }, { status: 400 });
    }

    await logAuditAction({
      action: "MEMBER_ACCEPTED",
      resource: "membership",
      resourceId: membership.id,
      workspaceId: membership.workspaceId,
      userId: membership.userId,
      ipHash: requestFingerprint(req),
    });

    return NextResponse.json({ message: "Convite aceito. Agora você já pode entrar no LexAI." });
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    return NextResponse.json({ error: "Não foi possível aceitar o convite." }, { status: 500 });
  }
}
