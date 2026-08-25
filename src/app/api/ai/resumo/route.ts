import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { texto, tipo } = await req.json();

    if (!texto) {
      return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback: resumo simulado para desenvolvimento sem chave
      return NextResponse.json({
        resumo: gerarResumoSimulado(texto, tipo),
      });
    }

    // Tenta Gemini primeiro, depois OpenAI como fallback
    if (process.env.GEMINI_API_KEY) {
      const resumo = await resumirComGemini(texto, tipo);
      return NextResponse.json({ resumo });
    }

    const resumo = await resumirComOpenAI(texto, tipo, apiKey);
    return NextResponse.json({ resumo });
  } catch (error: any) {
    console.error("Erro ao gerar resumo com IA:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar com IA" },
      { status: 500 }
    );
  }
}

async function resumirComGemini(texto: string, tipo: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildPrompt(texto, tipo),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    }
  );

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar o resumo.";
}

async function resumirComOpenAI(texto: string, tipo: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Não foi possível gerar o resumo.";
}

function buildPrompt(texto: string, tipo: string): string {
  return `Você é um assistente jurídico brasileiro especializado em explicar decisões judiciais de forma clara para advogados.

Analise esta ${tipo || "movimentação processual"} e gere um resumo objetivo em português do Brasil.

REGRAS:
- Inicie com um emoji e status claro (ex: ✅ DECISÃO FAVORÁVEL, ⚠️ ATENÇÃO, 📅 PRAZO, etc.)
- Explique o que aconteceu em 2-4 frases simples
- Destaque prazos ou obrigações importantes
- Use linguagem direta, sem jargões desnecessários
- Máximo 150 palavras

TEXTO DA MOVIMENTAÇÃO:
${texto}

RESUMO:`;
}

function gerarResumoSimulado(texto: string, tipo: string): string {
  const textoLower = texto.toLowerCase();

  if (textoLower.includes("procedente") || textoLower.includes("provid")) {
    return "✅ DECISÃO FAVORÁVEL: A decisão foi favorável ao seu cliente. Verifique os valores e prazos específicos no texto completo. Configure um alerta para acompanhar o recurso do réu.";
  }
  if (textoLower.includes("improcedente") || textoLower.includes("negad")) {
    return "❌ DECISÃO DESFAVORÁVEL: O pedido não foi atendido pelo juiz. Avalie a possibilidade de recurso no prazo legal. Consulte o texto completo para entender os fundamentos da decisão.";
  }
  if (textoLower.includes("audiência") || textoLower.includes("audiencia")) {
    return "📅 AUDIÊNCIA MARCADA: Foi designada uma audiência. Verifique a data, horário e local no texto completo. Notifique seu cliente e providencie a presença de testemunhas, se necessário.";
  }
  if (textoLower.includes("prazo") || textoLower.includes("manifest")) {
    return "⏰ PRAZO ABERTO: Há um prazo para manifestação ou cumprimento. Verifique a quantidade de dias e tome as providências necessárias antes do vencimento.";
  }

  return `📋 MOVIMENTAÇÃO REGISTRADA: Nova ${tipo || "movimentação"} registrada no processo. Acesse o texto completo para verificar os detalhes e tomar as providências necessárias.`;
}
