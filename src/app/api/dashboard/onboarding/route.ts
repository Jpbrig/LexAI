import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const onboardingStepSchema = z.object({
  workspace: z.boolean().optional(),
  processos: z.boolean().optional(),
  clientes: z.boolean().optional(),
  assistente: z.boolean().optional(),
});

const DEFAULT_STATE = {
  workspace: false,
  processos: false,
  clientes: false,
  assistente: false,
};

function normalizeState(input: unknown): Record<string, boolean> {
  if (!input || typeof input !== "object") {
    return { ...DEFAULT_STATE };
  }

  const parsed = onboardingStepSchema.safeParse(input);

  if (!parsed.success) {
    return { ...DEFAULT_STATE };
  }

  return {
    workspace: Boolean(parsed.data.workspace),
    processos: Boolean(parsed.data.processos),
    clientes: Boolean(parsed.data.clientes),
    assistente: Boolean(parsed.data.assistente),
  };
}

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();

    const body = await req.json().catch(() => null);
    const state = normalizeState(body?.state);

    const appSession = await prisma.appSession.update({
      where: { id: context.sessionId },
      data: {
        onboardingState: state,
      },
      select: {
        onboardingState: true,
      },
    });

    return NextResponse.json({
      onboardingState: appSession.onboardingState as Record<string, boolean>,
    });
  } catch (error) {
    console.error("Erro ao persistir onboarding:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar o progresso do onboarding." },
      { status: 500 },
    );
  }
}
