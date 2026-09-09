import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();

    const members = await prisma.membership.findMany({
      where: { workspaceId: context.workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            oab: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const mappedMembers = members.map((mem) => {
      // Mapeamento visual reverso baseado na lógica do front
      let perfilVisual = "ASSOCIATE";
      if (mem.role === "OWNER" || mem.role === "ADMIN") perfilVisual = "ADMIN";
      else if (mem.role === "MEMBER") perfilVisual = "ASSOCIATE";
      else if (mem.role === "READ_ONLY") perfilVisual = "INTERN";

      return {
        id: mem.id,
        userId: mem.userId,
        nome: mem.user.name || "Usuário Pendente",
        email: mem.user.email || "",
        perfil: perfilVisual,
        mfa: "🔐 Ativo (TOTP)", // Placeholder: a checagem real de MFA seria via provider/accounts
        status: mem.status === "ACTIVE" ? "Ativo" : mem.status === "INVITED" ? "Convite Pendente" : "Inativo",
        isTitular: mem.role === "OWNER",
        role: mem.role,
      };
    });

    return NextResponse.json(mappedMembers);
  } catch (error) {
    console.error("Erro ao listar membros:", error);
    return NextResponse.json({ error: "Erro ao buscar membros." }, { status: 500 });
  }
}
