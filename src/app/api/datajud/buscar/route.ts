import { NextRequest, NextResponse } from "next/server";

const DATAJUD_BASE = "https://api-publica.datajud.cnj.jus.br";

// Mapa de tribunais para endpoints do DataJud
const tribunalEndpoints: Record<string, string> = {
  TJSP: "tjsp",
  TJRJ: "tjrj",
  TJMG: "tjmg",
  TJRS: "tjrs",
  TJPR: "tjpr",
  TJSC: "tjsc",
  TJBA: "tjba",
  TJPE: "tjpe",
  TJCE: "tjce",
  TJGO: "tjgo",
  TRF1: "trf1",
  TRF2: "trf2",
  TRF3: "trf3",
  TRF4: "trf4",
  TRF5: "trf5",
  TRF6: "trf6",
  TRT1: "trt1",
  TRT2: "trt2",
  TRT3: "trt3",
  TRT4: "trt4",
  TRT15: "trt15",
  STJ: "stj",
  STF: "stf",
  TST: "tst",
};

export async function POST(req: NextRequest) {
  try {
    const { numeroCnj, tribunal } = await req.json();

    if (!numeroCnj) {
      return NextResponse.json({ error: "Número CNJ é obrigatório" }, { status: 400 });
    }

    // Detecta tribunal automaticamente pelo número CNJ se não informado
    const tribunalCode = tribunal || detectarTribunal(numeroCnj);
    const endpoint = tribunalEndpoints[tribunalCode?.toUpperCase()];

    if (!endpoint) {
      return NextResponse.json(
        { error: `Tribunal '${tribunalCode}' não suportado ou não encontrado` },
        { status: 400 }
      );
    }

    // Busca na API pública do DataJud
    const response = await fetch(`${DATAJUD_BASE}/api_publica_${endpoint}/_search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey cDZHYzlZa0JadVREZDJCendFbGFDa3M6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==`,
      },
      body: JSON.stringify({
        query: {
          match: {
            numeroProcesso: numeroCnj.replace(/[^0-9]/g, ""),
          },
        },
        size: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`DataJud retornou status ${response.status}`);
    }

    const data = await response.json();
    const hits = data?.hits?.hits;

    if (!hits || hits.length === 0) {
      return NextResponse.json(
        { error: "Processo não encontrado no DataJud" },
        { status: 404 }
      );
    }

    const processo = hits[0]._source;

    return NextResponse.json({
      numeroCnj: processo.numeroProcesso,
      tribunal: tribunalCode.toUpperCase(),
      classe: processo.classe?.nome || "Não informado",
      assunto: processo.assuntos?.[0]?.nome || "Não informado",
      orgaoJulgador: processo.orgaoJulgador?.nome || "Não informado",
      dataDistribuicao: processo.dataHoraUltimaAtualizacao || null,
      movimentacoes: (processo.movimentos || []).slice(0, 20).map((mov: any) => ({
        data: mov.dataHora,
        tipo: mov.nome,
        descricao: mov.complementosTabelados?.[0]?.descricao || mov.nome,
        complemento: mov.complemento || null,
      })),
    });
  } catch (error: any) {
    console.error("Erro ao buscar no DataJud:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao consultar o DataJud" },
      { status: 500 }
    );
  }
}

function detectarTribunal(numeroCnj: string): string {
  // Formato CNJ: NNNNNNN-DD.AAAA.J.TT.OOOO
  // Posição J.TT: tipo de justiça e tribunal
  const nums = numeroCnj.replace(/\D/g, "");
  if (nums.length < 17) return "";
  const justica = nums[13]; // J = tipo de justiça
  const tribunal = nums.slice(14, 16); // TT = código do tribunal

  if (justica === "8") {
    // Justiça Estadual
    const estaduais: Record<string, string> = {
      "26": "TJSP",
      "19": "TJRJ",
      "13": "TJMG",
      "21": "TJRS",
      "16": "TJPR",
      "12": "TJSC",
      "05": "TJBA",
      "06": "TJPE",
      "07": "TJCE",
      "09": "TJGO",
    };
    return estaduais[tribunal] || "TJSP";
  }
  if (justica === "4") return `TRF${tribunal.replace(/^0/, "")}`;
  if (justica === "5") return `TRT${tribunal.replace(/^0/, "")}`;
  if (justica === "3") return "TRE";
  return "TJSP";
}
