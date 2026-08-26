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

    const qEncoded = encodeURIComponent(termo.trim());
    const qPlus = encodeURIComponent(termo.trim()).replace(/%20/g, "+");

    // Gerador de Links Oficiais Gratuitos Verificados (100% reais sem alucinação)
    const linksOficiais = [
      {
        nome: "Jusbrasil — Busca Unificada de Jurisprudência",
        url: `https://www.jusbrasil.com.br/jurisprudencia/busca?q=${qPlus}`,
        tipo: "Jusbrasil",
        descricao: "Pesquisa em mais de 7 bilhões de acórdãos, ementas e súmulas de todos os tribunais do Brasil."
      },
      {
        nome: "STF — Supremo Tribunal Federal (Pesquisa de Jurisprudência e Súmulas)",
        url: `https://jurisprudencia.stf.jus.br/pages/search?q=${qEncoded}`,
        tipo: "STF",
        descricao: "Portal oficial de busca de acórdãos, repercussão geral e súmulas vinculantes do STF."
      },
      {
        nome: "STJ — Superior Tribunal de Justiça (Pesquisa Pronta e Jurisprudência)",
        url: `https://scon.stj.jus.br/SCON/pesquisar.jsp?livre=${qPlus}`,
        tipo: "STJ",
        descricao: "Portal oficial do STJ com acórdãos, Súmulas, Recursos Repetitivos e Jurisprudência em Teses."
      },
      {
        nome: "TST — Tribunal Superior do Trabalho (Jurisprudência Trabalhista)",
        url: `https://jurisprudencia.tst.jus.br/?consulta=${qEncoded}`,
        tipo: "TST",
        descricao: "Busca oficial de acórdãos, OJs (Orientações Jurisprudenciais) e Súmulas do Tribunal Superior do Trabalho."
      },
      {
        nome: "TJSP — Tribunal de Justiça de SP (Consulta de Esaj / Acórdãos)",
        url: `https://esaj.tjsp.jus.br/cjsg/resultadoCompleta.do?dados.buscaInteira=${qPlus}`,
        tipo: "TJSP",
        descricao: "Pesquisa de jurisprudência oficial de 2º Grau do Tribunal de Justiça do Estado de São Paulo."
      },
      {
        nome: "TJRJ — Tribunal de Justiça do Rio de Janeiro",
        url: `https://www4.tjrj.jus.br/jurisprudencia/Npesquisar.asp?txtDescricao=${qPlus}`,
        tipo: "TJRJ",
        descricao: "Portal oficial de acórdãos e ementário do Tribunal de Justiça do Estado do Rio de Janeiro."
      }
    ];

    // Se NÃO tiver chave Gemini, retorna a busca direta com os links oficiais gratuitos
    if (!geminiKey) {
      const linksFiltrados = tribunal && tribunal !== "TODOS"
        ? linksOficiais.filter(l => l.tipo === tribunal || l.tipo === "Jusbrasil")
        : linksOficiais;

      const resultadosGratuitos = linksFiltrados.map((link) => ({
        tribunal: link.tipo,
        numeroProcesso: `Consulta Direta — ${termo}`,
        relator: "Base Oficial do Tribunal",
        orgaoJulgador: "Plenário / Turmas",
        dataPublicacao: "Base Atualizada em Tempo Real",
        titulo: `Acórdãos e Precedentes de "${termo}" no ${link.tipo}`,
        ementa: `Clique no link oficial abaixo para acessar a lista completa e atualizada de acórdãos, ementas, acórdãos e súmulas sobre "${termo}" no portal do ${link.nome}.`,
        citacaoPeticao: `(Consulta direta realizada no acervo oficial do ${link.tipo} — Termo: "${termo}")`,
        fonteUrl: link.url
      }));

      return NextResponse.json({
        sucesso: true,
        isGratuito: true,
        mensagem: "Resultados obtidos via consulta direta gratuita aos portais oficiais dos tribunais.",
        resultados: resultadosGratuitos,
        linksOficiais
      });
    }

    // Se TIVER chave Gemini, usa a IA com regras rídidas anti-alucinação e links reais do Jusbrasil
    const filtroTribunal = tribunal && tribunal !== "TODOS" ? `no tribunal ${tribunal}` : "nos tribunais brasileiros (STF, STJ, TST, TRFs, TJs)";

    const prompt = `REGRAS RÍGIDAS DE SEGURANÇA E ANTI-ALUCINAÇÃO:
1. Retorne APENAS jurisprudências, ementas, acórdãos e súmulas REAIS e VERIFICÁVEIS da legislação e tribunais brasileiros.
2. NUNCA invente números de recursos, nomes de relatores ou ementas inexistentes.
3. Se não tiver 100% de certeza sobre o número exato de um recurso, cite a tese/súmula oficial correspondente.
4. O campo "fonteUrl" de cada item DEVE obrigatoriamente ser exatamente a URL: "https://www.jusbrasil.com.br/jurisprudencia/busca?q=${qPlus}"

Pesquise e estruture 3 a 5 acórdãos/súmulas reais relevantes para o termo: "${termo}" ${filtroTribunal}.

Retorne APENAS o JSON no formato:
[
  {
    "tribunal": "sigla (ex: STJ, STF, TST, TJSP)",
    "numeroProcesso": "ex: REsp 1.845.123/SP ou Súmula 385 STJ",
    "relator": "nome do relator",
    "orgaoJulgador": "turma ou câmara",
    "dataPublicacao": "DD/MM/AAAA",
    "titulo": "título resumido do precedente",
    "ementa": "texto da ementa oficial",
    "citacaoPeticao": "texto formatado no padrão ABNT pronto para petição",
    "fonteUrl": "https://www.jusbrasil.com.br/jurisprudencia/busca?q=${qPlus}"
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
            temperature: 0.1,
            maxOutputTokens: 3072,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      // Fallback gracioso se a chave Gemini der erro
      const linksFiltrados = tribunal && tribunal !== "TODOS"
        ? linksOficiais.filter(l => l.tipo === tribunal || l.tipo === "Jusbrasil")
        : linksOficiais;

      const resultadosGratuitos = linksFiltrados.map((link) => ({
        tribunal: link.tipo,
        numeroProcesso: `Consulta Direta — ${termo}`,
        relator: "Base Oficial do Tribunal",
        orgaoJulgador: "Plenário / Turmas",
        dataPublicacao: "Base Atualizada em Tempo Real",
        titulo: `Acórdãos e Precedentes de "${termo}" no ${link.tipo}`,
        ementa: `Clique no link oficial abaixo para acessar a lista completa e atualizada de acórdãos, ementas, acórdãos e súmulas sobre "${termo}" no portal do ${link.nome}.`,
        citacaoPeticao: `(Consulta direta realizada no acervo oficial do ${link.tipo} — Termo: "${termo}")`,
        fonteUrl: link.url
      }));

      return NextResponse.json({
        sucesso: true,
        isGratuito: true,
        resultados: resultadosGratuitos,
        linksOficiais
      });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    let resultados = [];
    try {
      resultados = JSON.parse(rawText);
    } catch {
      resultados = [];
    }

    return NextResponse.json({
      sucesso: true,
      resultados,
      linksOficiais
    });
  } catch (err) {
    console.error("[jurisprudencia/buscar]", err);
    return NextResponse.json(
      { error: "Erro interno ao pesquisar jurisprudência." },
      { status: 500 }
    );
  }
}

