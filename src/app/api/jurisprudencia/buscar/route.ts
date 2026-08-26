import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { termo, tribunal, geminiKey } = body;

    if (!termo || termo.trim().length < 2) {
      return NextResponse.json(
        { error: "Digite ao menos uma palavra-chave para realizar a pesquisa de jurisprudência." },
        { status: 400 }
      );
    }

    if (!geminiKey) {
      return NextResponse.json(
        { error: "Chave API Gemini não configurada. Acesse Configurações → Conectores & Credenciais." },
        { status: 400 }
      );
    }

    const filtroTribunal = tribunal && tribunal !== "TODOS" ? `no tribunal ${tribunal}` : "nos tribunais brasileiros (STF, STJ, TST, TRFs, TJs)";

    const prompt = `REGRAS RÍGIDAS DE SEGURANÇA E ANTI-ALUCINAÇÃO:
1. Retorne APENAS jurisprudências, ementas, acórdãos e súmulas REAIS e VERIFICÁVEIS da legislação e tribunais brasileiros.
2. NUNCA invente números de recursos, nomes de relatores ou ementas inexistentes.
3. As informações devem ser baseadas no acervo do STF, STJ, TST, TJs ou Jusbrasil (jusbrasil.com.br).
4. Retorne em formato JSON válido contendo uma lista de objetos com os seguintes campos:
   - "tribunal": sigla do tribunal (ex: STJ, STF, TJSP, TJRJ, TST)
   - "numeroProcesso": número do processo/recurso (ex: REsp 1.845.123/SP)
   - "relator": nome do relator (ex: Min. Nancy Andrighi)
   - "orgaoJulgador": turma ou câmara (ex: 3ª Turma)
   - "dataPublicacao": data aproximada ou formato DD/MM/AAAA
   - "titulo": título resumido da tese ou caso
   - "ementa": texto da ementa oficial resumida com fundamentação legal
   - "citacaoPeticao": texto formatado pronto para copiar e colar na petição no padrão forense (ABNT)
   - "fonteUrl": link de busca no Jusbrasil ("https://www.jusbrasil.com.br/jurisprudencia/busca?q=" + termo)

Pesquise e estruture 3 a 5 acórdãos/súmulas relevantes para o termo: "${termo}" ${filtroTribunal}.

Retorne APENAS o JSON no formato:
[
  {
    "tribunal": "...",
    "numeroProcesso": "...",
    "relator": "...",
    "orgaoJulgador": "...",
    "dataPublicacao": "...",
    "titulo": "...",
    "ementa": "...",
    "citacaoPeticao": "...",
    "fonteUrl": "..."
  }
]`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 3072,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      const msg = errData?.error?.message || `Erro na API Gemini (HTTP ${geminiRes.status}). Verifique sua chave em Configurações.`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    let resultados = [];
    try {
      resultados = JSON.parse(rawText);
    } catch {
      resultados = [];
    }

    return NextResponse.json({ sucesso: true, resultados });
  } catch (err) {
    console.error("[jurisprudencia/buscar]", err);
    return NextResponse.json(
      { error: "Erro interno ao pesquisar jurisprudência." },
      { status: 500 }
    );
  }
}
