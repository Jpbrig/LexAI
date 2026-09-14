import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { z } from "zod";
import { logAuditAction } from "@/lib/audit";
import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { sendWorkspaceInvite } from "@/lib/workspace-invitations";
import { isRateLimited, requestFingerprint } from "@/lib/rate-limit";

const INVITE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const inviteSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.enum(["ADMIN", "ASSOCIATE", "LAWYER", "INTERN", "SECRETARY"]),
});

export async function POST(req: NextRequest) {
  try {
    if (await isRateLimited(req, "workspace-invite", 10, 60_000)) return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.USERS_INVITE)) return forbiddenResponse();

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { name, email, role } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Mapear role visual para role do banco
    let dbRole: "ADMIN" | "LAWYER" | "INTERN" | "SECRETARY" = "LAWYER";
    if (role === "ADMIN") dbRole = "ADMIN";
    else if (role === "INTERN") dbRole = "INTERN";
    else if (role === "SECRETARY") dbRole = "SECRETARY";

    // 1. Verificar se usuário já existe
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Criar usuário placeholder (sem senha)
      user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          plano: "FREE",
        },
      });
    }

    // 2. Verificar se a associação já existe
    const existingMembership = await prisma.membership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: context.workspaceId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: "O e-mail já pertence a este escritório." }, { status: 409 });
    }

    // 3. Criar a associação
    const inviteToken = randomBytes(32).toString("hex");
    const inviteTokenHash = createHash("sha256").update(inviteToken).digest("hex");
    const inviteExpiresAt = new Date(Date.now() + INVITE_DURATION_MS);

    // SQL parametrizado mantém compatibilidade com clientes Prisma gerados
    // antes da migration, enquanto a migração é aplicada no deploy.
    const membership = await prisma.$transaction(async (tx) => {
      const created = await tx.membership.create({
        data: { workspaceId: context.workspaceId, userId: user.id, role: dbRole, status: "INVITED" },
      });
      await tx.$executeRaw(Prisma.sql`
        UPDATE "Membership" SET "inviteTokenHash" = ${inviteTokenHash}, "inviteExpiresAt" = ${inviteExpiresAt}
        WHERE id = ${created.id}
      `);
      return created;
    });

    await logAuditAction({
      action: "MEMBER_INVITED",
      resource: "membership",
      resourceId: membership.id,
      context,
      ipHash: requestFingerprint(req),
      metadata: { invitedUserId: user.id, role: dbRole },
    });

    // 4. (Opcional) Gerar token de verificação e registrar notificação
    const inviteLink = `${new URL(req.url).origin}/auth/aceitar-convite?token=${inviteToken}`;
    const emailSent = await sendWorkspaceInvite({ workspaceId: context.workspaceId, email: normalizedEmail, name, inviteLink }).catch((error) => {
      console.error("Erro ao enviar convite:", error);
      return false;
    });

    return NextResponse.json({ 
      success: true, 
      message: "Convite criado com sucesso.",
      membershipId: membership.id,
      emailSent,
      inviteLink: emailSent ? undefined : inviteLink,
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao convidar membro:", error);
    return NextResponse.json({ error: "Erro ao criar convite." }, { status: 500 });
  }
}
