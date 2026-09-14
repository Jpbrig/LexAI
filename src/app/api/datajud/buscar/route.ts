import { NextRequest, NextResponse } from "next/server";
import { forbiddenResponse, getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { requireServerSecret } from "@/lib/env";
import { getWorkspaceIntegrationValue } from "@/lib/integration-credentials";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";

const DATAJUD_BASE = "https://api-publica.datajud.cnj.jus.br";

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

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) return unauthorizedResponse();
    if (!hasPermission(authContext, PERMISSIONS.PROCESSES_READ)) return forbiddenResponse();

    const apiKey = await getWorkspaceIntegrationValue(authContext.workspaceId, "DATAJUD", "DATAJUD_API_KEY") || requireServerSecret("DATAJUD_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "A integração DataJud está temporariamente indisponível." },
        { status: 503 },
      );
    }

    const body = await req.json();
    const numeroCnj = typeof body.numeroCnj === "string" ? body.numeroCnj.trim() : "";
    const tribunalInformado = typeof body.tribunal === "string" ? body.tribunal.trim() : "";

    if (!numeroCnj) {
      return NextResponse.json({ error: "Número CNJ é obrigatório." }, { status: 400 });
    }

    const tribunalCode = (tribunalInformado || detectarTribunal(numeroCnj)).toUpperCase();
    const endpoint = tribunalEndpoints[tribunalCode];
    if (!endpoint) {
      return NextResponse.json(
        { error: `Tribunal '${tribunalCode}' não suportado ou não encontrado.` },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let response: Response;

    try {
      response = await fetch(`${DATAJUD_BASE}/api_publica_${endpoint}/_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `APIKey ${apiKey}`,
        },
        body: JSON.stringify({
          query: {
            match: {
              numeroProcesso: numeroCnj.replace(/[^0-9]/g, ""),
            },
          },
          size: 1,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error("DataJud respondeu com erro", { status: response.status, tribunal: tribunalCode });
      return NextResponse.json(
        { error: "Não foi possível consultar o DataJud neste momento." },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const data = await response.json();
    const hits = data?.hits?.hits;
    if (!Array.isArray(hits) || hits.length === 0) {
      return NextResponse.json({ error: "Processo não encontrado no DataJud." }, { status: 404 });
    }

    const processo = hits[0]?._source;
    if (!processo) {
      return NextResponse.json({ error: "Resposta inválida do DataJud." }, { status: 502 });
    }

    return NextResponse.json({
      numeroCnj: processo.numeroProcesso,
      tribunal: tribunalCode,
      classe: processo.classe?.nome || "Não informado",
      assunto: processo.assuntos?.[0]?.nome || "Não informado",
      orgaoJulgador: processo.orgaoJulgador?.nome || "Não informado",
      dataDistribuicao: processo.dataHoraUltimaAtualizacao || null,
      movimentacoes: Array.isArray(processo.movimentos)
        ? processo.movimentos.slice(0, 20).map((mov: Record<string, unknown>) => ({
            data: mov.dataHora,
            tipo: mov.nome,
            descricao:
              (mov.complementosTabelados as Array<{ descricao?: string }> | undefined)?.[0]?.descricao || mov.nome,
            complemento: mov.complemento || null,
          }))
        : [],
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "A consulta DataJud expirou. Tente novamente." }, { status: 504 });
    }

    console.error("Erro ao buscar no DataJud:", error);
    return NextResponse.json({ error: "Erro interno ao consultar o DataJud." }, { status: 500 });
  }
}

function detectarTribunal(numeroCnj: string): string {
  const nums = numeroCnj.replace(/\D/g, "");
  if (nums.length < 17) return "";

  const justica = nums[13];
  const tribunal = nums.slice(14, 16);

  if (justica === "8") {
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
    return estaduais[tribunal] || "";
  }
  if (justica === "4") return `TRF${tribunal.replace(/^0/, "")}`;
  if (justica === "5") return `TRT${tribunal.replace(/^0/, "")}`;
  if (justica === "3") return "TRE";
  return "";
}
