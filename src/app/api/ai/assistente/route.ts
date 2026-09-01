import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { requireServerSecret } from "@/lib/env";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    text: z.string().trim().min(1).max(20_000),
  })).max(30).default([]),
  text: z.string().trim().min(1).max(20_000),
});

const systemPrompt = `Você é um assistente jurídico especializado em Direito Brasileiro.

Regras obrigatórias:
1. Nunca invente leis, artigos, súmulas, números de processos, decisões ou jurisprudências.
2. Fundamente respostas somente em legislação oficial vigente e fontes judiciais verificáveis.
3. Quando não tiver certeza ou faltar contexto, declare a limitação e recomende consultar a fonte oficial.
4. Nunca apresente aconselhamento definitivo para um caso concreto sem ressalvar a necessidade de análise profissional.
5. Responda em português do Brasil, de forma técnica, clara e objetiva.`;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthContext())) return unauthorizedResponse();

    const apiKey = requireServerSecret("GEMINI_API_KEY");
    if (!apiKey) {
      return NextResponse.json({ error: "O assistente IA está temporariamente indisponível." }, { status: 503 });
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
    }

    const history = parsed.data.messages
      .map((message) => `${message.role === "user" ? "Usuário" : "Assistente"}: ${message.text}`)
      .join("\n");
    const prompt = `${systemPrompt}\n\nHistórico:\n${history}\nUsuário: ${parsed.data.text}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
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
      return NextResponse.json({ error: "O assistente não conseguiu responder neste momento." }, { status: 502 });
    }

    const data = await response.json();
    const resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof resposta !== "string" || !resposta.trim()) {
      return NextResponse.json({ error: "O assistente não retornou conteúdo." }, { status: 502 });
    }

    return NextResponse.json({ resposta });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "A resposta do assistente expirou." }, { status: 504 });
    }

    console.error("Erro no assistente IA:", error);
    return NextResponse.json({ error: "Erro interno no assistente IA." }, { status: 500 });
  }
}
