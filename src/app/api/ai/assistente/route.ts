import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { requireServerSecret } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const MAX_MEMORY_MESSAGES = 8;

type SessionMemory = {
  messages: Array<{ role: "user" | "assistant"; text: string }>;
};

function mapWorkspaceRoleToPersona(role?: string) {
  switch (role) {
    case "OWNER":
      return "sócio ou responsável pelo escritório";
    case "ADMIN":
      return "administrador do escritório";
    case "LAWYER":
      return "advogado responsável pelo caso";
    case "SECRETARY":
      return "secretária jurídica";
    case "INTERN":
      return "estagiário jurídico";
    case "READ_ONLY":
      return "colaborador com visão de leitura";
    case "MEMBER":
    default:
      return "colaborador do escritório";
  }
}

function getRoleSpecificGuidance(role?: string) {
  switch (role) {
    case "OWNER":
      return "Você está respondendo para um sócio ou responsável pelo escritório. Priorizem visão estratégica, risco, impacto operacional e decisões que ajudem a governar o escritório com mais clareza. Foque em síntese executiva, priorização e oportunidades de melhoria do workflow.";
    case "ADMIN":
      return "Você está respondendo para um administrador do escritório. Priorizem organização, coordenação, processos internos, prazos, pendências e automações práticas. Respostas podem incluir checklist, apoio à gestão do escritório e sugestões de eficiência operacional.";
    case "LAWYER":
      return "Você está respondendo para um advogado. A resposta deve ser mais técnica, orientada a estratégia processual, riscos, próximos passos e suporte à análise do caso. Mantenha foco em fundamentos, alternativas, prazos e cuidado com a necessidade de revisão profissional.";
    case "SECRETARY":
      return "Você está respondendo para uma secretária jurídica. Priorize organização, agenda, documentos, prazos, contatos, checklist de rotina e apoio à execução administrativa. Respostas devem ser práticas, fáceis de seguir e úteis para o dia a dia do escritório.";
    case "INTERN":
      return "Você está respondendo para um estagiário jurídico. Use uma linguagem pedagógica, explique os conceitos com clareza, proponha passos simples de aprendizado e destaque o que deve ser conferido por alguém mais experiente. Evite respostas excessivamente conclusivas para casos concretos.";
    case "READ_ONLY":
      return "Você está respondendo para um colaborador com visão de leitura. Foque em explicações claras, resumo executivo e orientação geral, sem profundidade excessiva em decisões sensíveis ou operacionais.";
    case "MEMBER":
    default:
      return "Você está respondendo para um colaborador do escritório. Use um tom útil, organizado e profissional, com foco em produtividade, clareza e apoio prático ao trabalho cotidiano.";
  }
}

function normalizeSessionMemory(value: unknown): SessionMemory {
  if (typeof value !== "object" || value === null) {
    return { messages: [] };
  }

  const raw = value as Partial<SessionMemory>;
  const messages = Array.isArray(raw.messages)
    ? raw.messages
        .filter(
          (message): message is { role: "user" | "assistant"; text: string } =>
            typeof message?.role === "string" &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message?.text === "string" &&
            message.text.trim().length > 0,
        )
        .slice(-MAX_MEMORY_MESSAGES)
    : [];

  return { messages };
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().trim().min(1).max(20_000),
});

const requestSchema = z.object({
  text: z.string().trim().min(1).max(20_000).optional(),
  message: z.string().trim().min(1).max(20_000).optional(),
  messages: z.array(messageSchema).max(30).optional().default([]),
  history: z.array(messageSchema).max(30).optional().default([]),
});

const systemPrompt = `Você é o Assistente Jurídico do LexAI: uma IA útil, conversa com naturalidade e ajuda advogados e escritórios de forma prática.

Objetivo principal:
- Responder em português do Brasil, com linguagem clara, humana, direta e acolhedora.
- Dar apoio jurídico geral, sem substituir a análise profissional do advogado.
- Explicar conceitos de forma simples, útil e bem organizada.
- Quando faltar contexto, dizer isso com transparência e sugerir o próximo passo mais seguro.

Regras obrigatórias:
1. Nunca invente leis, artigos, súmulas, números de processos, decisões ou jurisprudências.
2. Fundamente respostas somente em legislação oficial vigente e fontes judiciais verificáveis.
3. Se a informação não for segura, diga isso com clareza e sugira consultar a fonte oficial.
4. Nunca apresente aconselhamento definitivo para um caso concreto sem ressalvar a necessidade de revisão profissional.
5. Use um tom conversacional, mas profissional: acolhedor, organizado e objetivo.
6. Prefira respostas curtas, úteis e bem estruturadas, com foco em clareza.
7. Quando possível, inicie com uma frase cordial e termine com uma sugestão prática.
8. Estruture a resposta em blocos fáceis de ler, com títulos curtos e listas curtas quando fizer sentido.
9. Se o usuário pedir um resumo, dê um panorama em 3 partes: contexto, pontos principais e próxima ação.
10. Se o usuário pedir ajuda para decidir o próximo passo, responda com orientação prática, priorizando segurança e continuidade do trabalho.

Formato de resposta preferido:
- 1 frase de acolhimento curta
- 2 a 4 blocos curtos de explicação
- 1 sugestão prática final
- Sempre mantenha a resposta útil para quem trabalha no dia a dia do escritório.

Formato exigido para as respostas:
1) Inicie com uma saudação breve e amigável.
2) Use pequenos blocos com títulos curtos, como "Resumo", "Pontos principais" e "Próximo passo".
3) Evite respostas muito longas; seja objetivo, mas completo.
4) Se a pergunta exigir cautela, destaque a necessidade de revisão profissional.
5) Quando possível, ofereça uma ação concreta que o usuário pode fazer agora.`;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) return unauthorizedResponse();

    const [userProfile, membership, existingAppSession] = await Promise.all([
      prisma.user.findUnique({
        where: { id: authContext.userId },
        select: {
          name: true,
          oab: true,
          plano: true,
          platformRole: true,
        },
      }),
      prisma.membership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: authContext.workspaceId,
            userId: authContext.userId,
          },
        },
        select: {
          role: true,
        },
      }),
      prisma.appSession.findUnique({
        where: { id: authContext.sessionId },
        select: { aiMemory: true },
      }),
    ]);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Não consegui interpretar sua mensagem. Tente novamente em alguns instantes." },
        { status: 400 },
      );
    }

    const fallbackText = typeof body.text === "string" ? body.text : typeof body.message === "string" ? body.message : "";
    const rawMessages = Array.isArray(body.messages) ? body.messages : Array.isArray(body.history) ? body.history : [];

    const parsed = requestSchema.safeParse({
      text: fallbackText,
      message: typeof body.message === "string" ? body.message : undefined,
      messages: rawMessages,
      history: rawMessages,
    });

    if (!parsed.success || !parsed.data.text?.trim()) {
      return NextResponse.json(
        { error: "Escreva uma pergunta ou tema para o assistente jurídico." },
        { status: 400 },
      );
    }

    const apiKey = requireServerSecret("GEMINI_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "A IA do LexAI está sendo configurada no momento. Volte em alguns minutos." },
        { status: 503 },
      );
    }

    const normalizedMessages = parsed.data.messages
      .filter((message) => typeof message?.text === "string" && message.text.trim())
      .slice(-20)
      .map((message) => ({
        role: message.role,
        text: message.text.trim(),
      }));

    const history = normalizedMessages
      .map((message) => `${message.role === "user" ? "Usuário" : "Assistente"}: ${message.text}`)
      .join("\n");

    const personaLabel = mapWorkspaceRoleToPersona(membership?.role ?? "MEMBER");
    const roleSpecificGuidance = getRoleSpecificGuidance(membership?.role ?? "MEMBER");
    const userContextSummary = [
      `Nome do usuário: ${userProfile?.name ?? "Usuário"}`,
      `Perfil no workspace: ${membership?.role ?? "MEMBER"}`,
      `Persona do usuário: ${personaLabel}`,
      `Plano atual: ${userProfile?.plano ?? "FREE"}`,
      `OAB registrada: ${userProfile?.oab ?? "Não informada"}`,
      `Nível plataforma: ${userProfile?.platformRole ?? "USER"}`,
    ].join("\n");

    const sessionMemory = normalizeSessionMemory(existingAppSession?.aiMemory);
    const memoryMessages = sessionMemory.messages.length
      ? sessionMemory.messages.map((message) => `${message.role === "user" ? "Usuário" : "Assistente"}: ${message.text}`).join("\n")
      : "Sem histórico anterior.";

    const prompt = `${systemPrompt}\n\nContexto do usuário:\n${userContextSummary}\n\nInstruções de persona por papel:\n${roleSpecificGuidance}\n\nMemória da sessão atual:\n${memoryMessages}\n\nHistórico recente do chat:\n${history || "Sem histórico anterior."}\n\nUsuário: ${parsed.data.text.trim()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let response: Response;

    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
          cache: "no-store",
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error("Gemini respondeu com erro no assistente", { status: response.status });
      return NextResponse.json(
        { error: "Não consegui responder agora. Tente novamente em alguns instantes." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof resposta !== "string" || !resposta.trim()) {
      return NextResponse.json(
        { error: "A IA respondeu sem conteúdo útil. Tente uma pergunta diferente." },
        { status: 502 },
      );
    }

    const updatedMemory: SessionMemory = {
      messages: [...sessionMemory.messages, { role: "user", text: parsed.data.text.trim() }, { role: "assistant", text: resposta.trim() }].slice(-MAX_MEMORY_MESSAGES),
    };

    await prisma.appSession.update({
      where: { id: authContext.sessionId },
      data: {
        aiMemory: updatedMemory,
      },
    }).catch(() => null);

    return NextResponse.json({ resposta });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "A IA demorou mais do que o esperado. Tente uma pergunta mais curta." },
        { status: 504 },
      );
    }

    console.error("Erro no assistente IA:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir a resposta do assistente no momento." },
      { status: 500 },
    );
  }
}
