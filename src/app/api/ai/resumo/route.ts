import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { getWorkspaceIntegrationValue } from "@/lib/integration-credentials";
import { z } from "zod";
import { forbiddenResponse } from "@/lib/auth-guard";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { isRateLimited } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const requestSchema = z.object({
  texto: z.string().trim().min(1).max(100_000),
  tipo: z.string().trim().max(100).optional().default("movimentação processual"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) return unauthorizedResponse();
    if (!hasPermission(authContext, PERMISSIONS.AI_TOOLS_USE)) return forbiddenResponse();
    if (await isRateLimited(req, "ai-resumo", 10, 60_000)) {
      return NextResponse.json({ error: "Limite de uso da IA atingido. Aguarde um minuto." }, { status: 429 });
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Preciso de um texto válido para gerar o resumo com a IA." },
        { status: 400 },
      );
    }

    const geminiKey = await getWorkspaceIntegrationValue(authContext.workspaceId, "GEMINI", "GEMINI_API_KEY");
    const openAIKey = !geminiKey ? await getWorkspaceIntegrationValue(authContext.workspaceId, "OPENAI", "OPENAI_API_KEY") : null;
    const apiKey = geminiKey || openAIKey;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "A IA do LexAI está sendo configurada no momento. Volte em alguns minutos." },
        { status: 503 },
      );
    }

    const resultado = await logger.trace(
      "ai-resumo",
      "Gerar resumo de movimentação",
      () =>
        geminiKey
          ? resumirComGemini(parsed.data.texto, parsed.data.tipo, apiKey)
          : resumirComOpenAI(parsed.data.texto, parsed.data.tipo, apiKey),
      { workspaceId: authContext.workspaceId, userId: authContext.userId }
    );

    return NextResponse.json({
      resumo: resultado.resumoTecnico,
      resumoTecnico: resultado.resumoTecnico,
      resumoCliente: resultado.resumoCliente,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "A IA demorou mais do que o esperado. Tente novamente com um texto menor." },
        { status: 504 },
      );
    }

    logger.error("Erro ao gerar resumo de movimentação", {}, error);
    return NextResponse.json(
      { error: "Não consegui gerar o resumo agora. Tente novamente em alguns instantes." },
      { status: 502 },
    );
  }
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

async function resumirComGemini(texto: string, tipo: string, apiKey: string) {
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
    {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(texto, tipo) }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini respondeu ${response.status}`);
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  try {
    return JSON.parse(rawText) as { resumoTecnico: string; resumoCliente: string };
  } catch {
    return { resumoTecnico: rawText, resumoCliente: rawText };
  }
}

async function resumirComOpenAI(texto: string, tipo: string, apiKey: string) {
  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildPrompt(texto, tipo) }],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI respondeu ${response.status}`);
  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "{}";

  try {
    return JSON.parse(rawText) as { resumoTecnico: string; resumoCliente: string };
  } catch {
    return { resumoTecnico: rawText, resumoCliente: rawText };
  }
}

function buildPrompt(texto: string, tipo: string) {
  return `Você é um assistente jurídico brasileiro especializado em analisar decisões judiciais e traduzir movimentações para escritórios de advocacia.

Analise esta ${tipo} e retorne EXATAMENTE um objeto JSON válido (sem texto antes ou depois) com a seguinte estrutura:

{
  "resumoTecnico": "Resumo técnico sucinto para o advogado com status, prazos e providências processuais.",
  "resumoCliente": "Mensagem empática e transparente em linguagem simples (sem juridiquês) pronta para envio no WhatsApp ou e-mail ao cliente, explicando o que aconteceu e o próximo passo."
}

REGRAS RIGOROSAS:
- Não invente leis, artigos, prazos ou dados inexistentes no texto.
- Se houver prazo processual, destaque explicitamente em resumoTecnico.
- Em resumoCliente, use tom cordial, tranquilo e profissional.

TEXTO DA MOVIMENTAÇÃO:
${texto}`;
}
