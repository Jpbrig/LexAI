import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-guard";
import { canManageWorkspace } from "@/lib/authorization";
import { z } from "zod";

const inviteSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.enum(["ADMIN", "ASSOCIATE", "INTERN", "SECRETARY"]),
});

export async function POST(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!canManageWorkspace(context)) return forbiddenResponse();

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { name, email, role } = parsed.data;

    // Mapear role visual para role do banco
    let dbRole: "ADMIN" | "MEMBER" | "READ_ONLY" = "MEMBER";
    if (role === "ADMIN") dbRole = "ADMIN";
    else if (role === "ASSOCIATE") dbRole = "MEMBER";
    else if (role === "INTERN" || role === "SECRETARY") dbRole = "READ_ONLY";

    // 1. Verificar se usuário já existe
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Criar usuário placeholder (sem senha)
      user = await prisma.user.create({
        data: {
          name,
          email,
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
    const membership = await prisma.membership.create({
      data: {
        workspaceId: context.workspaceId,
        userId: user.id,
        role: dbRole,
        status: "INVITED",
      },
    });

    // 4. (Opcional) Gerar token de verificação e registrar notificação
    const inviteLink = `https://lexai.com.br/auth/aceitar-convite?email=${email}&workspace=${context.workspaceId}`;

    return NextResponse.json({ 
      success: true, 
      message: "Convite criado com sucesso.",
      membershipId: membership.id,
      inviteLink // Fallback para visualização no console caso o email falhe
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao convidar membro:", error);
    return NextResponse.json({ error: "Erro ao criar convite." }, { status: 500 });
  }
}
