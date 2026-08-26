import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Endpoints oficiais de APIs públicas e gratuitas
const DATAJUD_BASE = "https://api-publica.datajud.cnj.jus.br";
const RECEITA_WS_BASE = "https://receitaws.com.br/v1";
const BRASIL_API_BASE = "https://brasilapi.com.br/api";
const VIACEP_BASE = "https://viacep.com.br/ws";

export async function POST(req: NextRequest) {
  try {
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
      // 1. Consulta Real de CEP (ViaCEP / Correios API Pública Grátis)
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
                fonte: "ViaCEP / Correios (Base Oficial em Tempo Real)",
                dados: {
                  cep: dataCep.cep,
                  logradouro: dataCep.logradouro || "Não informado",
                  bairro: dataCep.bairro || "Não informado",
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
          { error: "CEP não encontrado na base pública dos Correios." },
          { status: 404 }
        );
      }

      // 2. Buscador Processual (DataJud / CNJ API Pública)
      case "buscador": {
        try {
          const resDataJud = await fetch(`${DATAJUD_BASE}/api_publica_tjsp/_search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `ApiKey cDZHYzlZa0JadVREZDJCendFbGFDa3M6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==`,
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
            const data = await resDataJud.json();
            const hits = data?.hits?.hits || [];
            if (hits.length > 0) {
              const resultados = hits.map((h: any) => ({
                numeroCnj: h._source?.numeroProcesso,
                classe: h._source?.classe?.nome || "Ação Cível",
                tribunal: "TJSP / CNJ",
                orgaoJulgador: h._source?.orgaoJulgador?.nome || "Vara Cível",
                dataAtualizacao: h._source?.dataHoraUltimaAtualizacao,
              }));
              return NextResponse.json({ sucesso: true, tipo, dados: resultados, fonte: "DataJud / CNJ API Oficial em Tempo Real" });
            }
          }
        } catch {}

        return NextResponse.json(
          { error: `Nenhum processo encontrado no DataJud/CNJ para o termo '${termoLimpo}'.` },
          { status: 404 }
        );
      }

      // 3. Sociedades e Empresas / Grupo Econômico (ReceitaWS / BrasilAPI CNPJ Real)
      case "empresas":
      case "grupo_cnpj": {
        if (termoNumerico.length !== 14) {
          return NextResponse.json(
            { error: "Insira um CNPJ válido com 14 dígitos (ex: 00.000.000/0001-91)." },
            { status: 400 }
          );
        }

        try {
          // Tenta BrasilAPI CNPJ primeiro
          const resBrasilCnpj = await fetch(`${BRASIL_API_BASE}/cnpj/v1/${termoNumerico}`);
          if (resBrasilCnpj.ok) {
            const cnpjData = await resBrasilCnpj.json();
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
                capitalSocial: `R$ ${parseFloat(cnpjData.capital_social || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                quadroSocietarioQSA: cnpjData.qsa?.map((s: any) => ({
                  nomeSocio: s.nome_socio_raz_social || s.nome,
                  qualificacao: s.qualificacao_socio || s.qual,
                })) || [],
                cnaePrincipal: cnpjData.cnae_fiscal_descricao,
                endereco: `${cnpjData.logradouro}, ${cnpjData.numero} - ${cnpjData.bairro}, ${cnpjData.municipio}/${cnpjData.uf} (CEP: ${cnpjData.cep})`,
              },
            });
          }

          // Fallback para ReceitaWS
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
                  endereco: `${cnpjData.logradouro}, ${cnpjData.numero} - ${cnpjData.bairro}, ${cnpjData.municipio}/${cnpjData.uf}`,
                },
              });
            }
          }
        } catch {}

        return NextResponse.json(
          { error: "CNPJ não encontrado na base pública da Receita Federal." },
          { status: 404 }
        );
      }

      // 4. Situação Cadastral de CPF (BrasilAPI CPF Público)
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
          { error: `O CPF ${termoLimpo} não foi retornado ou exige chave privada autorizada Serpro/RFB.` },
          { status: 404 }
        );
      }

      // 5. Veículo / Renavam / Rastreamento
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

        // Tentar consultar placa via BrasilAPI fipe se aplicável
        return NextResponse.json(
          { error: `A consulta pública de Veículo/RENAVAM para '${termoLimpo}' exige credencial paga do SENATRAN/SINESP ou API comercial (DirectData/Infosimples).` },
          { status: 404 }
        );
      }

      // 6. Localização de Devedores (Serpro / CADIN / PGFN)
      case "localizacao": {
        return NextResponse.json(
          { error: `A consulta da Dívida Ativa da União (Serpro/PGFN) e Novo CADIN para '${termoLimpo}' exige convênio oficial ou chave comercial paga (Serpro API Center / DirectData).` },
          { status: 404 }
        );
      }

      // Default para demais ferramentas comerciais
      default: {
        return NextResponse.json(
          { error: `A consulta '${tipo}' para o termo '${termoLimpo}' exige integração com API comercial contratada (DirectData / Infosimples / Serpro).` },
          { status: 404 }
        );
      }
    }
  } catch (error: any) {
    console.error("Erro na API de Consultas:", error);
    return NextResponse.json(
      { error: "Erro interno ao conectar aos servidores de consulta." },
      { status: 500 }
    );
  }
}
