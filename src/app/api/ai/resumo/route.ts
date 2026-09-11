import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { requireServerSecret } from "@/lib/env";
import { z } from "zod";

const requestSchema = z.object({
  texto: z.string().trim().min(1).max(100_000),
  tipo: z.string().trim().max(100).optional().default("movimentação processual"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthContext())) return unauthorizedResponse();

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Preciso de um texto válido para gerar o resumo com a IA." },
        { status: 400 },
      );
    }

    const apiKey = requireServerSecret("GEMINI_API_KEY") || requireServerSecret("OPENAI_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "A IA do LexAI está sendo configurada no momento. Volte em alguns minutos." },
        { status: 503 },
      );
    }

    const resumo = requireServerSecret("GEMINI_API_KEY")
      ? await resumirComGemini(parsed.data.texto, parsed.data.tipo, apiKey)
      : await resumirComOpenAI(parsed.data.texto, parsed.data.tipo, apiKey);

    return NextResponse.json({ resumo });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "A IA demorou mais do que o esperado. Tente novamente com um texto menor." },
        { status: 504 },
      );
    }

    console.error("Erro ao gerar resumo com IA:", error);
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
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini respondeu ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar o resumo.";
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
      max_tokens: 512,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI respondeu ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Não foi possível gerar o resumo.";
}

function buildPrompt(texto: string, tipo: string) {
  return `Você é um assistente jurídico brasileiro especializado em explicar decisões judiciais de forma clara para advogados.

Analise esta ${tipo} e gere um resumo objetivo em português do Brasil.

REGRAS:
- Inicie com um emoji e status claro.
- Explique o que aconteceu em 2-4 frases simples.
- Destaque prazos ou obrigações importantes.
- Use linguagem direta, sem jargões desnecessários.
- Máximo 150 palavras.
- Não invente leis, artigos, jurisprudência, processos ou prazos.

TEXTO DA MOVIMENTAÇÃO:
${texto}

RESUMO:`;
}
