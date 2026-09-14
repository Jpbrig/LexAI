import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { getAuthContext, forbiddenResponse, unauthorizedResponse } from "@/lib/auth-guard";
import { processoSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.PROCESSES_READ)) return forbiddenResponse();

    const processos = await prisma.processo.findMany({
      where: { workspaceId: context.workspaceId },
      include: {
        movimentacoes: {
          orderBy: { data: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(processos);
  } catch (error) {
    console.error("Erro na API de processos:", error);
    return NextResponse.json({ error: "Erro ao listar processos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.PROCESSES_CREATE)) return forbiddenResponse();

    const parsed = processoSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados do processo inválidos." }, { status: 400 });
    }

    const { numeroCnj, tribunal, classe, assunto, orgaoJulgador, notas } = parsed.data;
    const processo = await prisma.processo.create({
      data: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        numeroCnj,
        tribunal: tribunal.toUpperCase(),
        classe: classe || "Ação Cível",
        assunto: assunto || "Direito Geral",
        orgaoJulgador: orgaoJulgador || "Vara Única",
        notas,
        status: "ATIVO",
        dataDistribuicao: new Date(),
        movimentacoes: {
          create: {
            data: new Date(),
            tipo: "Distribuição",
            descricao: `Processo ${numeroCnj} cadastrado com sucesso e integrado ao acompanhamento automático.`,
            resumoIa: "🏛️ PROCESSO CADASTRADO: Processo registrado no LexAI. Acompanhamento automático ativado.",
          },
        },
      },
      include: { movimentacoes: true },
    });

    await prisma.alerta.create({
      data: {
        userId: context.userId,
        workspaceId: context.workspaceId,
        processoId: processo.id,
        tipo: "QUALQUER_MOVIMENTACAO",
        canal: "EMAIL",
        ativo: true,
      },
    });

    return NextResponse.json(processo, { status: 201 });
  } catch (error: unknown) {
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : null;
    if (errorCode === "P2002") {
      return NextResponse.json({ error: "Este processo já está cadastrado neste workspace." }, { status: 409 });
    }

    console.error("Erro ao salvar processo:", error);
    return NextResponse.json({ error: "Erro ao salvar processo." }, { status: 500 });
  }
}
