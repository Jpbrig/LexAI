import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { requireServerSecret } from "@/lib/env";

const pieceTypes = [
  "inicial",
  "contestacao",
  "recurso",
  "replica",
  "agravo",
  "hc",
  "embargos",
  "procuracao_ad_judicia",
  "procuracao_especial",
  "procuracao_administrativa",
  "procuracao_substabelecimento",
] as const;

const requestSchema = z.object({
  tipoPeca: z.enum(pieceTypes),
  requerente: z.string().trim().min(2).max(200),
  requerido: z.string().trim().min(2).max(200),
  juizo: z.string().trim().max(240).optional().default(""),
  fatos: z.string().trim().min(10).max(100_000),
  pedidos: z.string().trim().max(20_000).optional().default(""),
  valorCausa: z.string().trim().max(40).optional().default(""),
  numeroProcesso: z.string().trim().max(60).optional().default(""),
});

const PROMPTS: Record<(typeof pieceTypes)[number], string> = {
  inicial: "Redija uma petição inicial completa conforme o CPC brasileiro, com endereçamento, qualificação, fatos, direito, pedidos, provas, valor da causa e fechamento.",
  contestacao: "Redija uma contestação completa conforme o CPC, separando preliminares, mérito, impugnação documental e pedidos.",
  recurso: "Redija um recurso de apelação conforme o CPC, separando tempestividade, razões e pedido de provimento.",
  replica: "Redija uma réplica ou impugnação à contestação conforme o CPC, respondendo aos argumentos e pedidos relevantes.",
  agravo: "Redija um agravo de instrumento conforme o CPC, incluindo pedido de efeito suspensivo quando pertinente.",
  hc: "Redija um habeas corpus conforme o CPP, com paciente, autoridade coatora, fundamentos e pedido de liminar.",
  embargos: "Redija embargos de declaração conforme o CPC, identificando omissão, contradição, obscuridade ou erro material.",
  procuracao_ad_judicia: "Redija uma procuração ad judicia et extra judicia formal, com qualificação, poderes gerais e poderes especiais.",
  procuracao_especial: "Redija uma procuração com poderes especiais, limitando claramente o ato e o objeto autorizado.",
  procuracao_administrativa: "Redija uma procuração administrativa para representação perante órgãos públicos, com poderes específicos.",
  procuracao_substabelecimento: "Redija um substabelecimento, indicando substabelecente, substabelecido e reserva ou não de poderes.",
};

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthContext())) return unauthorizedResponse();

    const apiKey = requireServerSecret("GEMINI_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "A geração de documentos está temporariamente indisponível." },
        { status: 503 },
      );
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados insuficientes ou inválidos para gerar o documento." }, { status: 400 });
    }

    const data = parsed.data;
    const prompt = `${PROMPTS[data.tipoPeca]}

REGRAS DE SEGURANÇA:
- Não invente leis, artigos, súmulas, jurisprudências ou números de processo.
- Quando não houver certeza, use marcador para revisão profissional.
- O resultado é um rascunho e deve ser revisado por advogado antes de uso.
- Responda em português do Brasil, sem alegar validação oficial.

DADOS:
Juízo: ${data.juizo || "Não especificado"}
Número do processo: ${data.numeroProcesso || "A definir"}
Requerente/autor: ${data.requerente}
Requerido/réu: ${data.requerido}
Valor da causa: ${data.valorCausa || "A definir"}

FATOS:
${data.fatos}

PEDIDOS/OBJETO:
${data.pedidos || "Conforme os fatos, formular os pedidos cabíveis."}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
          }),
          signal: controller.signal,
          cache: "no-store",
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error("Gemini respondeu com erro na geração de documento", { status: response.status });
      return NextResponse.json({ error: "A IA não conseguiu gerar o documento neste momento." }, { status: 502 });
    }

    const geminiData = await response.json();
    const texto = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof texto !== "string" || !texto.trim()) {
      return NextResponse.json({ error: "A IA não retornou conteúdo. Tente novamente." }, { status: 502 });
    }

    return NextResponse.json({ sucesso: true, texto });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "A geração expirou. Tente novamente." }, { status: 504 });
    }

    console.error("Erro ao gerar documento:", error);
    return NextResponse.json({ error: "Erro interno ao processar a solicitação." }, { status: 500 });
  }
}
