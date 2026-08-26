import { NextResponse } from "next/server";

const PROMPTS: Record<string, string> = {
  inicial: `Você é um advogado especialista redator de peças processuais brasileiras.
Redija uma PETIÇÃO INICIAL completa e profissional conforme as regras do CPC brasileiro (Lei 13.105/2015).
Siga rigorosamente esta estrutura:
1. Endereçamento ao Juízo (EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA)
2. Qualificação completa das partes (Requerente e Requerido)
3. DOS FATOS (narrativa detalhada)
4. DO DIREITO (fundamentação legal e jurisprudencial)
5. DOS PEDIDOS (rol numerado de pedidos)
6. DA PROVA (especificação dos meios de prova)
7. DO VALOR DA CAUSA
8. Fecho e local/data
Use linguagem jurídica formal, artigos de lei e jurisprudência pertinentes.`,

  contestacao: `Você é um advogado especialista redator de peças processuais brasileiras.
Redija uma CONTESTAÇÃO completa e profissional conforme o CPC (Art. 335 e ss.).
Estrutura: PRELIMINARES → NO MÉRITO → IMPUGNAÇÃO AOS DOCUMENTOS → PEDIDOS.`,

  recurso: `Você é um advogado especialista redator de peças processuais brasileiras.
Redija um RECURSO DE APELAÇÃO completo conforme o CPC (Art. 1.009 e ss.).
Estrutura: TEMPESTIVIDADE → RAZÕES → PEDIDO DE PROVIMENTO.`,

  replica: `Você é um advogado especialista redator de peças processuais brasileiras.
Redija uma RÉPLICA / IMPUGNAÇÃO À CONTESTAÇÃO conforme o CPC (Art. 350 e ss.).`,

  agravo: `Você é um advogado especialista redator de peças processuais brasileiras.
Redija um AGRAVO DE INSTRUMENTO completo conforme o CPC (Art. 1.015 e ss.).
Inclua pedido de efeito suspensivo ou antecipação da tutela recursal.`,

  hc: `Você é um advogado criminalista especialista.
Redija um HABEAS CORPUS completo conforme o art. 647 e ss. do CPP.
Inclua qualificação do Paciente, Autoridade Coatora, fundamentos e pedido de liminar.`,

  embargos: `Você é um advogado especialista redator de peças processuais brasileiras.
Redija EMBARGOS DE DECLARAÇÃO conforme o CPC (Art. 1.022 e ss.).
Indique claramente omissão, contradição ou obscuridade.`,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipoPeca, requerente, requerido, juizo, fatos, pedidos, valorCausa, numeroProcesso, geminiKey } = body;

    if (!geminiKey) {
      return NextResponse.json(
        { error: "Chave API Gemini não configurada. Acesse Configurações → Conectores & Credenciais e adicione sua Google Gemini API Key." },
        { status: 400 }
      );
    }

    if (!tipoPeca || !requerente || !requerido || !fatos) {
      return NextResponse.json(
        { error: "Preencha ao menos: tipo de peça, requerente, requerido e fatos." },
        { status: 400 }
      );
    }

    const sistemaPrompt = PROMPTS[tipoPeca] || PROMPTS["inicial"];

    const userPrompt = `
Gere a peça processual com as seguintes informações:

TIPO DE PEÇA: ${tipoPeca.toUpperCase()}
JUÍZO / VARA: ${juizo || "Vara Cível — Não especificado"}
NÚMERO DO PROCESSO: ${numeroProcesso || "A numerar"}
REQUERENTE / AUTOR: ${requerente}
REQUERIDO / RÉU: ${requerido}
VALOR DA CAUSA: ${valorCausa ? "R$ " + valorCausa : "A ser fixado"}

FATOS:
${fatos}

PEDIDOS / OBJETO DA DEMANDA:
${pedidos || "Conforme os fatos expostos, requerer o acolhimento da pretensão."}

Gere o texto completo da peça processual, em português do Brasil, com linguagem jurídica formal. Use títulos em maiúsculas e parágrafos numerados. Inclua artigos de lei e jurisprudência relevante quando aplicável.
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sistemaPrompt + "\n\n" + userPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      const msg = errData?.error?.message || `Erro na API Gemini (HTTP ${geminiRes.status}). Verifique sua chave em Configurações.`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const texto = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!texto) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo. Tente novamente ou verifique sua chave Gemini." },
        { status: 502 }
      );
    }

    return NextResponse.json({ sucesso: true, texto });
  } catch (err) {
    console.error("[peticoes/gerar]", err);
    return NextResponse.json({ error: "Erro interno ao processar a solicitação." }, { status: 500 });
  }
}
