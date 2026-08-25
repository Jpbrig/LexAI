import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { termo } = await req.json();

    if (!termo || termo.trim().length < 3) {
      return NextResponse.json(
        { error: "Informe um CPF, CNPJ ou Nome com pelo menos 3 caracteres." },
        { status: 400 }
      );
    }

    const termoClean = termo.trim();
    const isCpf = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(termoClean) || /^\d{11}$/.test(termoClean);

    // Simula consulta agregada no Jusbrasil / DataJud por CPF ou Nome
    const resultados = [
      {
        numeroCnj: "0012345-67.2023.8.26.0100",
        tribunal: "TJSP",
        classe: "Ação de Indenização por Danos Morais",
        assunto: "Responsabilidade Civil",
        orgaoJulgador: "14ª Vara Cível — Foro Central SP",
        parteRequerente: isCpf ? "João da Silva (CPF: " + termoClean + ")" : termoClean,
        parteRequerida: "Empresa XYZ S/A",
        dataDistribuicao: "2023-03-12",
        status: "ATIVO",
        fonte: "Jusbrasil / DataJud API",
      },
      {
        numeroCnj: "0098765-43.2022.4.03.6100",
        tribunal: "TRF3",
        classe: "Mandado de Segurança Cível",
        assunto: "Direito Tributário / IRPF",
        orgaoJulgador: "2ª Vara Cível Federal de SP",
        parteRequerente: isCpf ? "João da Silva (CPF: " + termoClean + ")" : termoClean,
        parteRequerida: "Delegado da Receita Federal do Brasil",
        dataDistribuicao: "2022-07-05",
        status: "ATIVO",
        fonte: "Jusbrasil / DataJud API",
      },
      {
        numeroCnj: "0001122-33.2024.5.15.0001",
        tribunal: "TRT15",
        classe: "Reclamação Trabalhista Rito Sumaríssimo",
        assunto: "Horas Extras / Verbas Rescisórias",
        orgaoJulgador: "1ª Vara do Trabalho de Campinas",
        parteRequerente: isCpf ? "João da Silva (CPF: " + termoClean + ")" : termoClean,
        parteRequerida: "Logística & Transportes Ltda.",
        dataDistribuicao: "2024-01-19",
        status: "ATIVO",
        fonte: "Jusbrasil / DataJud API",
      },
    ];

    return NextResponse.json({
      termo: termoClean,
      totalEncontrados: resultados.length,
      processos: resultados,
    });
  } catch (error: any) {
    console.error("Erro na busca Jusbrasil por CPF/Nome:", error);
    return NextResponse.json(
      { error: "Erro ao realizar busca no Jusbrasil." },
      { status: 500 }
    );
  }
}
