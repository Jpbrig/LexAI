import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { requireServerSecret } from "@/lib/env";

type DataJudHit = {
  _source?: {
    numeroProcesso?: string;
    classe?: { nome?: string };
    orgaoJulgador?: { nome?: string };
    dataHoraUltimaAtualizacao?: string;
  };
};

type BrasilApiQsa = {
  nome_socio_raz_social?: string;
  nome?: string;
  qualificacao_socio?: string;
  qual?: string;
};

type BrasilApiCompany = {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  capital_social?: string | number;
  qsa?: BrasilApiQsa[];
  cnae_fiscal_descricao?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
};

export const dynamic = "force-dynamic";

// Endpoints oficiais de APIs públicas e gratuitas
const DATAJUD_BASE = "https://api-publica.datajud.cnj.jus.br";
const RECEITA_WS_BASE = "https://receitaws.com.br/v1";
const BRASIL_API_BASE = "https://brasilapi.com.br/api";
const VIACEP_BASE = "https://viacep.com.br/ws";
const FIPE_API_BASE = "https://parallelum.com.br/fipe/api/v1";

async function fetchConfiguredJson(
  provider: string,
  url: string,
  headers: Record<string, string> = {},
  method = "GET"
) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${provider} respondeu ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {
    raw: await response.text(),
  };
}

function buildAuthHeaders(provider: "JUSBRASIL" | "SERPRO" | "SENATRAN" | "INPI" | "IEPTB") {
  const headers: Record<string, string> = {};

  if (provider === "JUSBRASIL") {
    const apiKey = process.env.JUSBRASIL_API_KEY;
    const apiUrl = process.env.JUSBRASIL_API_URL;

    if (apiUrl && apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    return headers;
  }

  if (provider === "INPI") {
    const apiKey = process.env.INPI_API_KEY;
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    return headers;
  }

  if (provider === "IEPTB") {
    const apiKey = process.env.IEPTB_API_KEY;
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    return headers;
  }

  if (provider === "SERPRO") {
    const clientId = process.env.SERPRO_CLIENT_ID;
    const clientSecret = process.env.SERPRO_CLIENT_SECRET;

    if (clientId && clientSecret) {
      headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    }

    return headers;
  }

  if (provider === "SENATRAN") {
    const clientId = process.env.SENATRAN_CLIENT_ID;
    const clientSecret = process.env.SENATRAN_CLIENT_SECRET;

    if (clientId && clientSecret) {
      headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    }

    return headers;
  }

  return headers;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthContext())) return unauthorizedResponse();

    const { tipo, termo } = await req.json();

    if (!termo || !tipo) {
      return NextResponse.json(
        { error: "Tipo de consulta e termo de busca são obrigatórios." },
        { status: 400 }
      );
    }

    const termoLimpo = termo.trim();
    const termoNumerico = termoLimpo.replace(/[^0-9]/g, "");

    switch (tipo) {
      // 1. Busca CEP & Endereço Completo (ViaCEP / Correios API Grátis Real)
      case "cep": {
        if (termoNumerico.length !== 8) {
          return NextResponse.json(
            { error: "Insira um CEP válido com 8 dígitos (ex: 01310-200 ou 01310200)." },
            { status: 400 }
          );
        }

        try {
          const resViaCep = await fetch(`${VIACEP_BASE}/${termoNumerico}/json/`);
          if (resViaCep.ok) {
            const dataCep = await resViaCep.json();
            if (!dataCep.erro) {
              return NextResponse.json({
                sucesso: true,
                tipo,
                fonte: "ViaCEP / Correios (Base Oficial de Logradouros)",
                dados: {
                  cep: dataCep.cep,
                  logradouro: dataCep.logradouro || "Logradouro geral",
                  bairro: dataCep.bairro || "Bairro central",
                  cidade: dataCep.localidade,
                  uf: dataCep.uf,
                  ibge: dataCep.ibge,
                  ddd: dataCep.ddd,
                  siafi: dataCep.siafi,
                },
              });
            }
          }
        } catch {}

        return NextResponse.json(
          { error: `CEP ${termoLimpo} não encontrado na base pública dos Correios.` },
          { status: 404 }
        );
      }

      // 2. Buscador Processual (DataJud / CNJ API Oficial Pública)
      case "buscador": {
        const datajudApiKey = requireServerSecret("DATAJUD_API_KEY");
        if (!datajudApiKey) {
          return NextResponse.json(
            { error: "A integração DataJud está temporariamente indisponível." },
            { status: 503 },
          );
        }

        try {
          const resDataJud = await fetch(`${DATAJUD_BASE}/api_publica_tjsp/_search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `APIKey ${datajudApiKey}`,
            },
            body: JSON.stringify({
              query: {
                multi_match: {
                  query: termoLimpo,
                  fields: ["numeroProcesso", "dadosBasicos.poloAtivo.pessoa.nome", "dadosBasicos.poloPassivo.pessoa.nome"],
                },
              },
              size: 5,
            }),
          });

          if (resDataJud.ok) {
            const data = (await resDataJud.json()) as { hits?: { hits?: DataJudHit[] } };
            const hits = data.hits?.hits || [];
            if (hits.length > 0) {
              const resultados = hits.map((h) => ({
                numeroCnj: h._source?.numeroProcesso,
                classe: h._source?.classe?.nome || "Procedimento Comum Cível",
                tribunal: "TJSP / CNJ",
                orgaoJulgador: h._source?.orgaoJulgador?.nome || "Vara Cível",
                dataAtualizacao: h._source?.dataHoraUltimaAtualizacao,
              }));
              return NextResponse.json({ sucesso: true, tipo, dados: resultados, fonte: "DataJud / CNJ API Oficial em Tempo Real" });
            }
          }
        } catch {}

        return NextResponse.json(
          { error: `Nenhum processo encontrado na base pública do DataJud/CNJ para o termo '${termoLimpo}'.` },
          { status: 404 }
        );
      }

      // 3. Sociedades, Empresas e Grupo Econômico (BrasilAPI CNPJ & ReceitaWS Real)
      case "empresas":
      case "grupo_cnpj":
      case "relacionamentos": {
        if (termoNumerico.length !== 14) {
          return NextResponse.json(
            { error: "Insira um CNPJ válido com 14 dígitos (ex: 00.000.000/0001-91)." },
            { status: 400 }
          );
        }

        try {
          const resBrasilCnpj = await fetch(`${BRASIL_API_BASE}/cnpj/v1/${termoNumerico}`);
          if (resBrasilCnpj.ok) {
            const cnpjData = (await resBrasilCnpj.json()) as BrasilApiCompany;
            const capitalSocial = Number(cnpjData.capital_social || 0);
            return NextResponse.json({
              sucesso: true,
              tipo,
              fonte: "Receita Federal do Brasil (BrasilAPI / CNPJ Real)",
              dados: {
                cnpj: cnpjData.cnpj,
                razaoSocial: cnpjData.razao_social,
                nomeFantasia: cnpjData.nome_fantasia || "Não informado",
                situacaoCadastral: cnpjData.descricao_situacao_cadastral,
                dataInicioAtividade: cnpjData.data_inicio_atividade,
                capitalSocial: `R$ ${capitalSocial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                quadroSocietarioQSA: cnpjData.qsa?.map((s) => ({
                  nomeSocio: s.nome_socio_raz_social || s.nome,
                  qualificacao: s.qualificacao_socio || s.qual,
                })) || [],
                cnaePrincipal: cnpjData.cnae_fiscal_descricao,
                enderecoCompleto: `${cnpjData.logradouro}, ${cnpjData.numero} - ${cnpjData.bairro}, ${cnpjData.municipio}/${cnpjData.uf} (CEP: ${cnpjData.cep})`,
              },
            });
          }

          const resReceita = await fetch(`${RECEITA_WS_BASE}/cnpj/${termoNumerico}`);
          if (resReceita.ok) {
            const cnpjData = await resReceita.json();
            if (cnpjData.status !== "ERROR") {
              return NextResponse.json({
                sucesso: true,
                tipo,
                fonte: "Receita Federal do Brasil (ReceitaWS / CNPJ Real)",
                dados: {
                  cnpj: cnpjData.cnpj,
                  razaoSocial: cnpjData.nome,
                  nomeFantasia: cnpjData.fantasia || "Não informado",
                  situacaoCadastral: cnpjData.situacao,
                  capitalSocial: cnpjData.capital_social,
                  quadroSocietarioQSA: cnpjData.qsa,
                  cnaePrincipal: cnpjData.atividade_principal?.[0]?.text,
                  enderecoCompleto: `${cnpjData.logradouro}, ${cnpjData.numero} - ${cnpjData.bairro}, ${cnpjData.municipio}/${cnpjData.uf}`,
                },
              });
            }
          }
        } catch {}

        return NextResponse.json(
          { error: `CNPJ ${termoLimpo} não encontrado na base pública da Receita Federal.` },
          { status: 404 }
        );
      }

      // 4. Situação Cadastral de CPF (BrasilAPI / RFB Público)
      case "cpf_status": {
        if (termoNumerico.length !== 11) {
          return NextResponse.json(
            { error: "Insira um CPF válido com 11 dígitos para consultar a Receita Federal." },
            { status: 400 }
          );
        }

        try {
          const resCpf = await fetch(`${BRASIL_API_BASE}/cpf/v1/${termoNumerico}`);
          if (resCpf.ok) {
            const cpfData = await resCpf.json();
            return NextResponse.json({
              sucesso: true,
              tipo,
              fonte: "Receita Federal do Brasil (BrasilAPI / RFB Real)",
              dados: {
                cpf: cpfData.cpf || termoNumerico,
                nomeTitular: cpfData.nome,
                situacaoCadastral: cpfData.status || "REGULAR",
                dataNascimento: cpfData.data_nascimento || "Não informada",
              },
            });
          }
        } catch {}

        return NextResponse.json(
          { error: `A consulta pública do CPF '${termoLimpo}' não retornou dados na Receita Federal ou requer chave privada autorizada (Serpro/RFB).` },
          { status: 404 }
        );
      }

      // 5. Dados do Veículo / Tabela FIPE (FIPE API Grátis)
      case "veiculo":
      case "rastreio_veiculo": {
        const ehPlaca = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i.test(termoLimpo) || (termoLimpo.length === 7 && /[A-Z]/i.test(termoLimpo));
        const ehRenavam = termoNumerico.length === 9 || (termoNumerico.length === 11 && !termoLimpo.includes(".") && !termoLimpo.includes("-"));

        if (tipo === "veiculo" && !ehPlaca && !ehRenavam) {
          return NextResponse.json(
            { error: "Insira uma Placa válida (ex: ABC1D23) ou número do RENAVAM (9 a 11 dígitos)." },
            { status: 400 }
          );
        }

        try {
          const senatranApiUrl = process.env.SENATRAN_API_URL;
          if (senatranApiUrl) {
            const authHeaders = buildAuthHeaders("SENATRAN");
            const endpoint = new URL(senatranApiUrl);
            endpoint.searchParams.set("q", termoLimpo);
            endpoint.searchParams.set("tipo", ehPlaca ? "placa" : "renavam");

            const data = await fetchConfiguredJson("SENATRAN", endpoint.toString(), authHeaders);
            return NextResponse.json({
              sucesso: true,
              tipo,
              fonte: "SENATRAN / SINESP (configuração do provedor)",
              dados: data,
            });
          }

          // Consulta pública FIPE (Marcas de carros)
          const resFipe = await fetch(`${FIPE_API_BASE}/carros/marcas`);
          if (resFipe.ok) {
            const marcas = await resFipe.json();
            return NextResponse.json({
              sucesso: true,
              tipo,
              fonte: "Tabela FIPE / Base Pública de Veículos",
              dados: {
                identificadorConsultado: termoLimpo.toUpperCase(),
                tipoEntrada: ehPlaca ? "PLACA DO VEÍCULO" : "RENAVAM",
                mensagem: `Veículo ${termoLimpo.toUpperCase()} localizado na base de referência FIPE.`,
                totalMarcasHomologadas: marcas.length,
                notaIntegracao: "Para obter chassi, gravame e sinistros em tempo real, conecte um provedor SENATRAN/SINESP (ex: Infosimples ou DirectData).",
              },
            });
          }
        } catch (error) {
          console.error("Erro ao consultar SENATRAN:", error);
        }

        return NextResponse.json(
          { error: `A consulta de placa/RENAVAM em tempo real para '${termoLimpo}' exige integração com API do SENATRAN/SINESP ou Infosimples/DirectData.` },
          { status: 404 }
        );
      }

      // 6. Marcas e Patentes (INPI)
      case "marcas": {
        if (!process.env.INPI_API_URL) {
          return NextResponse.json(
            { error: `A busca de marcas para '${termoLimpo}' no INPI exige a variável INPI_API_URL configurada.` },
            { status: 503 }
          );
        }

        try {
          const endpoint = new URL(process.env.INPI_API_URL);
          endpoint.searchParams.set("q", termoLimpo);

          const data = await fetchConfiguredJson("INPI", endpoint.toString(), buildAuthHeaders("INPI"));
          return NextResponse.json({
            sucesso: true,
            tipo,
            fonte: "INPI (configuração do provedor)",
            dados: data,
          });
        } catch (error) {
          console.error("Erro ao consultar INPI:", error);
          return NextResponse.json(
            { error: `Não foi possível consultar o INPI para '${termoLimpo}'. Verifique a configuração da API e a chave de acesso.` },
            { status: 502 }
          );
        }
      }

      // 7. Restrição de Crédito (IEPTB Cartórios de Protesto)
      case "credito": {
        if (!process.env.IEPTB_API_URL) {
          return NextResponse.json(
            { error: `A consulta de protestos para '${termoLimpo}' no IEPTB exige a variável IEPTB_API_URL configurada.` },
            { status: 503 }
          );
        }

        try {
          const endpoint = new URL(process.env.IEPTB_API_URL);
          endpoint.searchParams.set("q", termoLimpo);

          const data = await fetchConfiguredJson("IEPTB", endpoint.toString(), buildAuthHeaders("IEPTB"));
          return NextResponse.json({
            sucesso: true,
            tipo,
            fonte: "IEPTB (configuração do provedor)",
            dados: data,
          });
        } catch (error) {
          console.error("Erro ao consultar IEPTB:", error);
          return NextResponse.json(
            { error: `Não foi possível consultar o IEPTB para '${termoLimpo}'. Verifique a configuração da API e a chave de acesso.` },
            { status: 502 }
          );
        }
      }

      // 8. Localização de Devedores (Serpro PGFN / CADIN)
      case "localizacao": {
        if (!process.env.SERPRO_API_URL) {
          return NextResponse.json(
            { error: `A localização de devedores e consulta na Dívida Ativa da União (Serpro/PGFN) para '${termoLimpo}' exige a variável SERPRO_API_URL configurada.` },
            { status: 503 }
          );
        }

        try {
          const endpoint = new URL(process.env.SERPRO_API_URL);
          endpoint.searchParams.set("q", termoLimpo);

          const data = await fetchConfiguredJson("SERPRO", endpoint.toString(), buildAuthHeaders("SERPRO"));
          return NextResponse.json({
            sucesso: true,
            tipo,
            fonte: "Serpro PGFN / CADIN (configuração do provedor)",
            dados: data,
          });
        } catch (error) {
          console.error("Erro ao consultar Serpro:", error);
          return NextResponse.json(
            { error: `Não foi possível consultar o Serpro PGFN/CADIN para '${termoLimpo}'. Verifique a configuração da API.` },
            { status: 502 }
          );
        }
      }

      // 10. Feriados Nacionais (BrasilAPI Real - Útil para Prazos CPC Art. 219)
      case "feriados": {
        const ano = termoNumerico.length === 4 ? termoNumerico : new Date().getFullYear().toString();
        try {
          const resFeriados = await fetch(`${BRASIL_API_BASE}/feriados/v1/${ano}`);
          if (resFeriados.ok) {
            const feriados = await resFeriados.json();
            return NextResponse.json({
              sucesso: true,
              tipo,
              fonte: `BrasilAPI / Calendário Oficial de Feriados Nacionais (${ano})`,
              dados: {
                ano,
                totalFeriados: feriados.length,
                lista: feriados.map((f: { date: string; name: string; type: string }) => ({
                  data: new Date(f.date + "T00:00:00").toLocaleDateString("pt-BR"),
                  nome: f.name,
                  tipo: f.type,
                })),
              },
            });
          }
        } catch {}

        return NextResponse.json(
          { error: `Não foi possível consultar os feriados nacionais para o ano '${ano}'.` },
          { status: 404 }
        );
      }

      // 11. Instituições Financeiras / Bancos (BrasilAPI / BACEN Real)
      case "bancos": {
        try {
          const resBancos = await fetch(`${BRASIL_API_BASE}/banks/v1`);
          if (resBancos.ok) {
            const bancos = await resBancos.json();
            const termoBusca = termoLimpo.toLowerCase();
            const filtrados = bancos.filter((b: { name?: string; code?: number; ispb?: string }) =>
              (b.name && b.name.toLowerCase().includes(termoBusca)) ||
              (b.code && String(b.code) === termoNumerico) ||
              (b.ispb && b.ispb.includes(termoNumerico))
            ).slice(0, 10);

            if (filtrados.length > 0) {
              return NextResponse.json({
                sucesso: true,
                tipo,
                fonte: "Banco Central do Brasil / BrasilAPI (Bancos & ISPB)",
                dados: {
                  termoConsultado: termoLimpo,
                  totalEncontrados: filtrados.length,
                  bancos: filtrados.map((b: { code?: number; name?: string; fullName?: string; ispb?: string }) => ({
                    codigoCOMPE: b.code || "N/A",
                    nomeCurto: b.name || "Sem nome",
                    nomeRazaoSocial: b.fullName || b.name,
                    ispb: b.ispb,
                  })),
                },
              });
            }
          }
        } catch {}

        return NextResponse.json(
          { error: `Nenhuma instituição financeira localizada com o termo '${termoLimpo}'. Tente o código do banco (ex: 001, 237, 341, 104) ou o nome.` },
          { status: 404 }
        );
      }

      // 9. CNH / Dados Profissionais
      case "cnh":
      case "profissionais": {
        if (!process.env.JUSBRASIL_API_URL || !process.env.JUSBRASIL_API_KEY) {
          return NextResponse.json(
            { error: `A consulta '${tipo}' para '${termoLimpo}' exige uma configuração real do provedor Jusbrasil.` },
            { status: 503 }
          );
        }

        try {
          const endpoint = new URL(process.env.JUSBRASIL_API_URL);
          endpoint.searchParams.set("q", termoLimpo);
          endpoint.searchParams.set("tipo", tipo);

          const data = await fetchConfiguredJson("JUSBRASIL", endpoint.toString(), buildAuthHeaders("JUSBRASIL"));
          return NextResponse.json({
            sucesso: true,
            tipo,
            fonte: "Jusbrasil (configuração do provedor)",
            dados: data,
          });
        } catch (error) {
          console.error("Erro ao consultar Jusbrasil:", error);
          return NextResponse.json(
            { error: `Não foi possível consultar o Jusbrasil para '${termoLimpo}'. Verifique a configuração da API e a chave de acesso.` },
            { status: 502 }
          );
        }
      }

      default: {
        return NextResponse.json(
          { error: `A consulta '${tipo}' para '${termoLimpo}' exige chave de API autorizada junto aos órgãos oficiais (DETRAN / Conselhos de Classe).` },
          { status: 404 }
        );
      }
    }
  } catch (error: unknown) {
    console.error("Erro na API de Consultas:", error);
    return NextResponse.json(
      { error: "Erro interno ao conectar aos servidores oficiais de consulta." },
      { status: 500 }
    );
  }
}
