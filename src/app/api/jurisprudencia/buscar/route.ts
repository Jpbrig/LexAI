import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forbiddenResponse, getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { requireServerSecret } from "@/lib/env";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";

const requestSchema = z.object({
  termo: z.string().trim().min(2).max(240),
  tribunal: z.string().trim().max(20).optional().default("TODOS"),
});

const linksOficiais = [
  {
    nome: "Jusbrasil — Busca Unificada de Jurisprudência",
    url: "https://www.jusbrasil.com.br/jurisprudencia/busca",
    tipo: "Jusbrasil",
    descricao: "Pesquisa unificada de acórdãos, ementas e súmulas.",
  },
  {
    nome: "STF — Pesquisa de Jurisprudência",
    url: "https://jurisprudencia.stf.jus.br/",
    tipo: "STF",
    descricao: "Portal oficial de jurisprudência do Supremo Tribunal Federal.",
  },
  {
    nome: "STJ — Pesquisa de Jurisprudência",
    url: "https://scon.stj.jus.br/SCON/",
    tipo: "STJ",
    descricao: "Portal oficial de acórdãos, súmulas e precedentes do STJ.",
  },
  {
    nome: "TST — Pesquisa de Jurisprudência",
    url: "https://jurisprudencia.tst.jus.br/",
    tipo: "TST",
    descricao: "Portal oficial de jurisprudência trabalhista do TST.",
  },
  {
    nome: "TJSP — Consulta de Jurisprudência",
    url: "https://esaj.tjsp.jus.br/cjsg/consultaCompleta.do",
    tipo: "TJSP",
    descricao: "Portal oficial de jurisprudência do Tribunal de Justiça de São Paulo.",
  },
  {
    nome: "TJRJ — Pesquisa de Jurisprudência",
    url: "https://www4.tjrj.jus.br/jurisprudencia/",
    tipo: "TJRJ",
    descricao: "Portal oficial de jurisprudência do Tribunal de Justiça do Rio de Janeiro.",
  },
];

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();
    if (!hasPermission(context, PERMISSIONS.AI_TOOLS_USE)) return forbiddenResponse();

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Informe um termo de busca válido." }, { status: 400 });
    }

    const { termo, tribunal } = parsed.data;
    const encodedTerm = encodeURIComponent(termo);
    const filteredLinks = tribunal === "TODOS"
      ? linksOficiais
      : linksOficiais.filter((link) => link.tipo === tribunal || link.tipo === "Jusbrasil");

    const geminiKey = requireServerSecret("GEMINI_API_KEY");
    if (!geminiKey) {
      return NextResponse.json({
        sucesso: true,
        isGratuito: true,
        mensagem: "Abra uma fonte oficial para consultar resultados atualizados.",
        resultados: filteredLinks.map((link) => ({
          tribunal: link.tipo,
          numeroProcesso: "Consulta oficial",
          relator: "Fonte oficial",
          orgaoJulgador: "Portal do tribunal",
          dataPublicacao: "Atualizado no portal oficial",
          titulo: `${link.nome}: ${termo}`,
          ementa: `${link.descricao} A pesquisa será realizada diretamente no portal oficial, sem afirmar que este resultado foi validado pelo LexAI.`,
          citacaoPeticao: "Consulte e confirme o precedente na fonte oficial antes de inserir em uma petição.",
          fonteUrl: `${link.url}?q=${encodedTerm}`,
        })),
        linksOficiais,
      });
    }

    const prompt = `Você é um assistente jurídico brasileiro. Retorne somente JSON válido com 3 a 5 precedentes reais e verificáveis sobre "${termo}" ${tribunal !== "TODOS" ? `no tribunal ${tribunal}` : ""}. Nunca invente número de processo, relator, ementa ou súmula. Se não tiver certeza, retorne uma lista vazia e indique que é necessária consulta oficial. Cada item deve conter tribunal, numeroProcesso, relator, orgaoJulgador, dataPublicacao, titulo, ementa, citacaoPeticao e fonteUrl. fonteUrl deve ser um portal oficial ou Jusbrasil, nunca uma URL inventada.`;
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
            "x-goog-api-key": geminiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 3072, responseMimeType: "application/json" },
          }),
          signal: controller.signal,
          cache: "no-store",
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json({ error: "A pesquisa assistida está indisponível neste momento." }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    let resultados: unknown = [];
    try {
      resultados = JSON.parse(rawText);
    } catch {
      resultados = [];
    }

    return NextResponse.json({
      sucesso: true,
      isGratuito: false,
      resultados: Array.isArray(resultados) ? resultados : [],
      linksOficiais,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "A pesquisa expirou. Tente novamente." }, { status: 504 });
    }

    console.error("Erro na busca de jurisprudência:", error);
    return NextResponse.json({ error: "Erro interno ao pesquisar jurisprudência." }, { status: 500 });
  }
}
