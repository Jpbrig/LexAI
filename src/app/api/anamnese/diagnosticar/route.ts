import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-guard";
import { getWorkspaceIntegrationValue } from "@/lib/integration-credentials";
import { isRateLimited } from "@/lib/rate-limit";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";
import { z } from "zod";

const requestSchema = z.object({
  tituloCaso: z.string().trim().min(2),
  areaDireito: z.string().default("CIVEL"),
  relatoFatos: z.string().trim().min(5),
  pedidosPretendidos: z.string().optional().default(""),
  provasDisponiveis: z.string().optional().default(""),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) return unauthorizedResponse();
    if (!hasPermission(authContext, PERMISSIONS.AI_TOOLS_USE)) return forbiddenResponse();
    if (await isRateLimited(req, "anamnese-diagnosticar", 10, 60_000)) {
      return NextResponse.json({ error: "Limite de diagnósticos por minuto atingido." }, { status: 429 });
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Preencha o relato dos fatos para gerar o diagnóstico." }, { status: 400 });
    }

    const apiKey = await getWorkspaceIntegrationValue(authContext.workspaceId, "GEMINI", "GEMINI_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "A IA do LexAI não está configurada (GEMINI_API_KEY)." },
        { status: 503 }
      );
    }

    const promptText = `Você é um advogado sênior e consultor jurídico brasileiro especializado em triagem de processos.
Analise a seguinte anamnese de caso e forneça um parecer em formato JSON com o diagnóstico completo:

ÁREA DO DIREITO: ${parsed.data.areaDireito}
TÍTULO/RESUMO: ${parsed.data.tituloCaso}
RELATO DOS FATOS: ${parsed.data.relatoFatos}
PEDIDOS PRETENDIDOS: ${parsed.data.pedidosPretendidos || "Não informado"}
PROVAS DISPONÍVEIS: ${parsed.data.provasDisponiveis || "Não informado"}

REGRAS:
- Retorne EXATAMENTE um objeto JSON válido (sem textos explicativos antes ou depois) com a seguinte estrutura:
{
  "tesePrincipal": "Breve resumo da tese jurídica aplicável...",
  "fundamentacaoLegal": ["Art. X da Lei Y", "Art. Z do Código Civil..."],
  "probabilidadeExito": "Alta | Média | Baixa",
  "analiseRiscoPrescricao": "Alertas sobre prazos prescricionais ou riscos processuais...",
  "provasFaltantes": ["Documento A", "Comprovante B..."],
  "esbocoPeticaoInicial": "Estrutura resumida da Petição Inicial com Fatos, Direito e Pedidos."
}
- Não invente leis, artigos ou prazos inexistentes. Responda em português do Brasil.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini respondeu com status ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let diagnosticoObj: Record<string, unknown>;
    try {
      diagnosticoObj = JSON.parse(rawText);
    } catch {
      diagnosticoObj = { tesePrincipal: rawText };
    }

    return NextResponse.json({ diagnostico: diagnosticoObj, rawText });
  } catch (error) {
    console.error("Erro ao gerar diagnóstico da anamnese:", error);
    return NextResponse.json({ error: "Não foi possível gerar o diagnóstico no momento." }, { status: 500 });
  }
}
