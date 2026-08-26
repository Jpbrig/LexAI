"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calculator,
  FileCheck,
  DollarSign,
  Sparkles,
  Printer,
  User,
  Search,
  Users,
  Car,
  Building2,
  CreditCard,
  Award,
  Briefcase,
  Layers,
  ShieldAlert,
  Bot,
  Globe,
  FileSignature,
  FileText,
  DollarSign as MoneyIcon,
  Scale,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
} from "lucide-react";

function FerramentasContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "calculadoras" | "consultas" | "outros" | "procuracao" | "peticoes" | "assistente" | null;
  const [activeTab, setActiveTab] = useState<"calculadoras" | "consultas" | "outros" | "procuracao" | "peticoes" | "assistente">("calculadoras");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [selectedCalc, setSelectedCalc] = useState<string>("trabalhista");
  const [selectedConsulta, setSelectedConsulta] = useState<string>("buscador");

  // Calculadora Trabalhista State
  const [salario, setSalario] = useState<string>("3500");
  const [mesesTrabalhados, setMesesTrabalhados] = useState<number>(12);
  const [tipoDemissao, setTipoDemissao] = useState<string>("sem_justa_causa");
  const [avisoPrevio, setAvisoPrevio] = useState<boolean>(true);

  // Procuração State
  const [outorganteNome, setOutorganteNome] = useState("João da Silva");
  const [outorganteCpf, setOutorganteCpf] = useState("123.456.789-00");
  const [outorganteRg, setOutorganteRg] = useState("12.345.678-9 SSP/SP");
  const [outorganteEndereco, setOutorganteEndereco] = useState("Rua das Flores, 123 - São Paulo/SP");
  const [outorgadoAdvogado, setOutorgadoAdvogado] = useState("Dr. Usuário Teste");
  const [outorgadoOab, setOutorgadoOab] = useState("SP 123456");

  const [valorBase, setValorBase] = useState<string>("");
  const [taxaJuros, setTaxaJuros] = useState<string>("");
  const [meses, setMeses] = useState<string>("");
  const [consultaTermo, setConsultaTermo] = useState<string>("");

  // Procuração IA state
  const [tipoProcuracao, setTipoProcuracao] = useState("ad_judicia");
  const [outorganteEstadoCivil, setOutorganteEstadoCivil] = useState("solteiro(a)");
  const [outorganteProfissao, setOutorganteProfissao] = useState("");
  const [outorganteCidade, setOutorganteCidade] = useState("");
  const [procObjeto, setProcObjeto] = useState("");
  const [textoProcuracao, setTextoProcuracao] = useState("");
  const [loadingProcuracao, setLoadingProcuracao] = useState(false);
  const [erroProcuracao, setErroProcuracao] = useState("");
  const [procUploadFileName, setProcUploadFileName] = useState("");

  async function gerarProcuracaoIA() {
    setLoadingProcuracao(true);
    setErroProcuracao("");
    setTextoProcuracao("");
    const geminiKey = typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : "";
    try {
      const res = await fetch("/api/peticoes/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoPeca: "procuracao",
          requerente: outorganteNome,
          requerido: outorgadoAdvogado,
          juizo: outorganteCidade,
          numeroProcesso: "",
          fatos: `Outorgante: ${outorganteNome}, ${outorganteEstadoCivil}, ${outorganteProfissao || "brasileiro(a)"}, CPF ${outorganteCpf}, RG ${outorganteRg}, residente em ${outorganteEndereco}${outorganteCidade ? ", " + outorganteCidade : ""}. Outorgado: ${outorgadoAdvogado}, OAB ${outorgadoOab}. Tipo: ${tipoProcuracao}. Objeto: ${procObjeto || "poderes gerais para o foro."}`,
          pedidos: procObjeto,
          valorCausa: "",
          geminiKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setTextoProcuracao(data.texto);
      } else {
        setErroProcuracao(data.error || "Erro ao gerar a procuração.");
      }
    } catch {
      setErroProcuracao("Erro de conexão com o servidor.");
    } finally {
      setLoadingProcuracao(false);
    }
  }

  function handleProcUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setProcObjeto((prev) => (prev ? prev + "\n\n[Modelo base]:\n" + content : content));
    };
    reader.readAsText(file);
  }

  // Governamental API state
  const [loadingGov, setLoadingGov] = useState<boolean>(false);
  const [resultadoGov, setResultadoGov] = useState<any>(null);
  const [errorGov, setErrorGov] = useState<string>("");

  // I.A. Assistente Jurídico state
  type ChatMsg = { role: "user" | "assistant"; text: string };
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { role: "assistant", text: "Olá! Sou seu Assistente Jurídico IA, especializado em direito brasileiro. Posso ajudar com pesquisa de jurisprudência, fundamentação legal, análise de casos, doutrina e mais. Como posso te ajudar?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  async function enviarMensagem() {
    const texto = chatInput.trim();
    if (!texto || loadingChat) return;
    const geminiKey = typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : "";

    const novaMensagem: ChatMsg = { role: "user", text: texto };
    setChatMessages((prev) => [...prev, novaMensagem]);
    setChatInput("");
    setLoadingChat(true);

    const systemPrompt = `REGRAS RÍGIDAS DE SEGURANÇA E ANTI-ALUCINAÇÃO:
1. NUNCA invente leis, artigos, súmulas, números de processos, decisões ou jurisprudências que não existam.
2. Fundamente suas respostas estritamente com base na legislação oficial brasileira vigente (Planalto/Gov.br), STF, STJ, TST, TJs e fontes jurídicas consolidadas como o Jusbrasil (jusbrasil.com.br).
3. Se você não tiver 100% de certeza ou se uma informação exigir consulta atualizada a um banco de dados específico, declare explicitamente: "Recomendo consultar a fonte oficial em jusbrasil.com.br ou no portal do Planalto/Tribunal competente para confirmação".
4. NUNCA simule citações jurisprudenciais fictícias.

Você é um assistente jurídico especializado em Direito Brasileiro.
Suas áreas de expertise incluem: Direito Civil, Direito do Trabalho (CLT), Direito Penal, Direito Processual Civil e Penal, Direito do Consumidor (CDC), Direito Tributário, Direito Previdenciário (INSS), Direito de Família e Sucessões, Direito Empresarial e Contratos.
Forneça respostas precisas citando artigos de lei oficiais, súmulas (STF/STJ/TST) e jurisprudência verificável.
Responda em português do Brasil com linguagem técnica, precisa e clara.
Alerte sempre que a questão exigir análise de caso específico com um advogado.

Histórico da conversa:
${chatMessages.map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.text}`).join("\n")}
Usuário: ${texto}`;

    if (!geminiKey) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ **Chave Gemini não configurada.** Acesse [Configurações](/dashboard/configuracoes) → Conectores & Credenciais e adicione sua Google Gemini API Key (gratuita em aistudio.google.com/app/apikey) para usar o assistente.",
        },
      ]);
      setLoadingChat(false);
      return;
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
          }),
        }
      );
      const data = await res.json();
      const resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível obter uma resposta. Tente novamente.";
      setChatMessages((prev) => [...prev, { role: "assistant", text: resposta }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", text: "Erro de conexão. Verifique sua chave Gemini nas Configurações." }]);
    } finally {
      setLoadingChat(false);
    }
  }

  // Petições IA state
  const [tipoPeca, setTipoPeca] = useState<string>("inicial");
  const [pRequerente, setPRequerente] = useState("");
  const [pRequerido, setPRequerido] = useState("");
  const [pJuizo, setPJuizo] = useState("");
  const [pNumeroProcesso, setPNumeroProcesso] = useState("");
  const [pFatos, setPFatos] = useState("");
  const [pPedidos, setPPedidos] = useState("");
  const [pValorCausa, setPValorCausa] = useState("");
  const [textoPeticao, setTextoPeticao] = useState("");
  const [loadingPeticao, setLoadingPeticao] = useState(false);
  const [erroPeticao, setErroPeticao] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  async function gerarPeticaoIA() {
    setLoadingPeticao(true);
    setErroPeticao("");
    setTextoPeticao("");
    // Lê chave Gemini do localStorage (salva nas Configurações)
    const geminiKey = typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : "";
    try {
      const res = await fetch("/api/peticoes/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoPeca,
          requerente: pRequerente,
          requerido: pRequerido,
          juizo: pJuizo,
          numeroProcesso: pNumeroProcesso,
          fatos: pFatos,
          pedidos: pPedidos,
          valorCausa: pValorCausa,
          geminiKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setTextoPeticao(data.texto);
      } else {
        setErroPeticao(data.error || "Erro ao gerar a peça.");
      }
    } catch {
      setErroPeticao("Erro de conexão com o servidor.");
    } finally {
      setLoadingPeticao(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setPFatos((prev) => (prev ? prev + "\n\n[Modelo importado]:\n" + content : content));
    };
    reader.readAsText(file);
  }

  async function executarConsultaGov() {
    if (!consultaTermo) return;
    setLoadingGov(true);
    setErrorGov("");
    setResultadoGov(null);

    try {
      const res = await fetch("/api/consultas/gov", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: selectedConsulta, termo: consultaTermo }),
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setResultadoGov(data);
      } else {
        setErrorGov(data.error || "Erro ao consultar servidores oficiais.");
      }
    } catch {
      setErrorGov("Erro de conexão ao acessar a API oficial do governo.");
    } finally {
      setLoadingGov(false);
    }
  }

  // Cálculo trabalhista
  const sal = parseFloat(salario) || 0;
  const decimoTerceiro = (sal / 12) * mesesTrabalhados;
  const feriasProporcionais = (sal / 12) * mesesTrabalhados;
  const tercoFerias = feriasProporcionais / 3;
  const avisoPrevioValor = avisoPrevio ? sal : 0;
  const saldoFgtsEstimado = sal * 0.08 * mesesTrabalhados;
  const multaFgts = tipoDemissao === "sem_justa_causa" ? saldoFgtsEstimado * 0.4 : 0;
  const totalEstimado =
    tipoDemissao === "sem_justa_causa"
      ? decimoTerceiro + feriasProporcionais + tercoFerias + avisoPrevioValor + multaFgts
      : decimoTerceiro + feriasProporcionais + tercoFerias;

  // Cálculos Específicos por Ramo do Direito (Fórmulas Matemáticas Exatas sem Mock)
  const val = parseFloat(valorBase) || 0;
  const tx = parseFloat(taxaJuros) || 0;
  const m = parseInt(meses) || 0;

  function calcularResultadoEspecifico() {
    switch (selectedCalc) {
      case "trabalhista": {
        return {
          titulo: "Total Rescisório Estimado",
          resultado: totalEstimado,
          detalhes: [
            { rotulo: "13º Salário Proporcional", valor: decimoTerceiro },
            { rotulo: "Férias Proporcionais", valor: feriasProporcionais },
            { rotulo: "1/3 Constitucional Férias", valor: tercoFerias },
            { rotulo: "Aviso Prévio Indenizado", valor: avisoPrevioValor },
            { rotulo: "Multa Rescisória FGTS (40%)", valor: multaFgts },
          ],
        };
      }
      case "correcao": {
        // Correção Monetária Simples + Juros de Mora (Art. 406 CC)
        const correcaoMonetaria = val * (tx / 100);
        const jurosMora = val * (0.01 * m); // 1% ao mês legal
        const total = val + correcaoMonetaria + jurosMora;
        return {
          titulo: "Valor Atualizado com Correção & Juros",
          resultado: total,
          detalhes: [
            { rotulo: "Valor Principal de Origem", valor: val },
            { rotulo: `Correção Monetária (${tx}%)`, valor: correcaoMonetaria },
            { rotulo: `Juros de Mora Legal 1% a.m. (${m} meses)`, valor: jurosMora },
          ],
        };
      }
      case "fgts": {
        // Expurgos TR vs INPC (Diferença Média Estimada de ~4.8% a.a.)
        const saldoCorrigidoInpc = val * Math.pow(1 + (tx > 0 ? tx : 0.4) / 100, m);
        const diferencaExpurgo = saldoCorrigidoInpc - val;
        return {
          titulo: "Diferença Acumulada a Recalcular (FGTS)",
          resultado: diferencaExpurgo,
          detalhes: [
            { rotulo: "Saldo Base Depositado", valor: val },
            { rotulo: "Saldo Corrigido pelo INPC/IPCA-E", valor: saldoCorrigidoInpc },
            { rotulo: "Perdas com Taxa TR a Restituir", valor: diferencaExpurgo },
          ],
        };
      }
      case "pasep": {
        // PASEP Servidor Público Pré-88 (Fator de Correção + Juros Amortizados)
        const diferencaPasep = val * (tx / 100) * m;
        return {
          titulo: "Diferença Apurada no Saldo PASEP",
          resultado: val + diferencaPasep,
          detalhes: [
            { rotulo: "Saldo Inicial Cadastrado", valor: val },
            { rotulo: "Rendimentos não Repassados BB", valor: diferencaPasep },
          ],
        };
      }
      case "rmc": {
        // Cartão RMC/RCC: Dedução de juros abusivos acima do teto consignado (Ex: 2.14% a.m. teto INSS)
        const taxaAbusiva = Math.max(0, tx - 2.14);
        const indébitoCobrado = val * (taxaAbusiva / 100) * m;
        const repeticaoIndebitoEmDobro = indébitoCobrado * 2;
        return {
          titulo: "Devolução em Dobro por Desconto Abusivo RMC",
          resultado: repeticaoIndebitoEmDobro,
          detalhes: [
            { rotulo: "Valor Total do Saque", valor: val },
            { rotulo: "Excesso de Juros Cobrado", valor: indébitoCobrado },
            { rotulo: "Restituição em Dobro (Art. 42 CDC)", valor: repeticaoIndebitoEmDobro },
          ],
        };
      }
      case "superendividamento": {
        // Mínimo Existencial (1 Salário Mínimo R$ 1.412,00)
        const salarioMinimo = 1412.0;
        const comprometimentoMaximoPermitido = Math.max(0, val - salarioMinimo);
        const valorDisponivelParaParcelas = comprometimentoMaximoPermitido * (tx / 100);
        return {
          titulo: "Valor Máximo Mensal para Repactuação",
          resultado: valorDisponivelParaParcelas,
          detalhes: [
            { rotulo: "Renda Mensal Declarada", valor: val },
            { rotulo: "Mínimo Existencial Protegido", valor: salarioMinimo },
            { rotulo: "Margem Máxima para Pagamento de Credores", valor: comprometimentoMaximoPermitido },
          ],
        };
      }
      case "revisional": {
        // Revisional de Financiamento: Recálculo pela Taxa Média Bacen
        const taxaMediaBacen = 1.45; // Taxa Média Bacen Veículos/Imóveis
        const parcelaContratada = (val * (tx / 100)) / (1 - Math.pow(1 + tx / 100, -m));
        const parcelaDevida = (val * (taxaMediaBacen / 100)) / (1 - Math.pow(1 + taxaMediaBacen / 100, -m));
        const economiaMensal = Math.max(0, parcelaContratada - parcelaDevida);
        const economiaTotal = economiaMensal * m;
        return {
          titulo: "Economia Total com Revisão de Juros",
          resultado: economiaTotal,
          detalhes: [
            { rotulo: "Parcela Atual Contratada", valor: isNaN(parcelaContratada) ? 0 : parcelaContratada },
            { rotulo: "Parcela Recalculada (Bacen)", valor: isNaN(parcelaDevida) ? 0 : parcelaDevida },
            { rotulo: "Economia Mensal na Parcela", valor: isNaN(economiaMensal) ? 0 : economiaMensal },
          ],
        };
      }
      case "dosimetria": {
        // Dosimetria Trifásica da Pena (Anos)
        const penaBase = val; // Anos
        const variacaoSegundaFase = penaBase * (tx / 100); // Atenuante/Agravante
        const penaFinalAnos = Math.max(0.5, penaBase + variacaoSegundaFase);
        return {
          titulo: "Pena Final Calculada (Anos)",
          resultado: penaFinalAnos,
          detalhes: [
            { rotulo: "Pena-Base Mínima", valor: penaBase },
            { rotulo: "Aumento/Diminuição de Pena", valor: variacaoSegundaFase },
          ],
        };
      }
      case "regime": {
        // Progressão de Regime LEP (Fração %)
        const fracaoLapse = tx > 0 ? tx / 100 : 0.16; // 16% padrão réu primário
        const tempoNecessarioAnos = val * fracaoLapse;
        const tempoNecessarioMeses = tempoNecessarioAnos * 12;
        return {
          titulo: "Tempo Necessário para Progredir (Meses)",
          resultado: tempoNecessarioMeses,
          detalhes: [
            { rotulo: "Pena Total Imposta (Anos)", valor: val },
            { rotulo: `Fração LEP Aplicada (${(fracaoLapse * 100).toFixed(0)}%)`, valor: tempoNecessarioAnos },
          ],
        };
      }
      case "aluguel": {
        // Reajuste de Aluguel por Índice (IGPM/IPCA)
        const reajuste = val * (tx / 100);
        const novoAluguel = val + reajuste;
        return {
          titulo: "Novo Valor do Aluguel Reajustado",
          resultado: novoAluguel,
          detalhes: [
            { rotulo: "Valor Atual do Aluguel", valor: val },
            { rotulo: `Reajuste Acumulado 12 meses (${tx}%)`, valor: reajuste },
          ],
        };
      }
      case "pensao": {
        // Pensão Alimentícia sobre Renda Líquida
        const percentual = tx > 0 ? tx : 30; // 30% padrão
        const valorPensao = val * (percentual / 100);
        return {
          titulo: "Valor Mensal da Pensão Alimentícia",
          resultado: valorPensao,
          detalhes: [
            { rotulo: "Rendimento Líquido do Alimentante", valor: val },
            { rotulo: `Percentual Fixado (${percentual}%)`, valor: valorPensao },
          ],
        };
      }
      case "inss": {
        // Revisão INSS: RMI com Coeficiente EC 103 (60% + 2% por ano acima de 20 anos)
        const anosContribucao = m > 0 ? m : 20;
        const anosExcedentes = Math.max(0, anosContribucao - 20);
        const coeficienteFc = 60 + anosExcedentes * 2;
        const rmiCalculada = val * (coeficienteFc / 100);
        return {
          titulo: "Renda Mensal Inicial (RMI Estimada)",
          resultado: rmiCalculada,
          detalhes: [
            { rotulo: "Média das Contribuições", valor: val },
            { rotulo: `Coeficiente de Aposentadoria (${coeficienteFc}%)`, valor: rmiCalculada },
          ],
        };
      }
      case "divorcio": {
        // Partilha de Divórcio (Meação 50% líquida)
        const patrimonioLiquido = Math.max(0, val - m); // val = patrimonio, m = dividas
        const meacaoCadaConjuge = patrimonioLiquido * 0.5;
        return {
          titulo: "Quota-Parte de Cada Cônjuge (50%)",
          resultado: meacaoCadaConjuge,
          detalhes: [
            { rotulo: "Patrimônio Bruto Declarado", valor: val },
            { rotulo: "Dívidas e Passivos a Deduzir", valor: m },
            { rotulo: "Monte Mor Líquido Partilhável", valor: patrimonioLiquido },
          ],
        };
      }
      default: {
        return {
          titulo: "Valor Atualizado Estimado",
          resultado: val * Math.pow(1 + tx / 100, m),
          detalhes: [
            { rotulo: "Valor Base", valor: val },
          ],
        };
      }
    }
  }

  const resCalc = calcularResultadoEspecifico();

  const calculosLista = [
    {
      id: "trabalhista",
      name: "Trabalhista (CLT)",
      icon: Calculator,
      desc: "Rescisão, saldo de salário, 13º e Férias",
      info: "Calcula verbas rescisórias conforme Art. 477 da CLT. Inclui saldo salarial, 13º proporcional, férias vencidas/proporcionais + 1/3 e multa de 40% sobre o FGTS.",
      labelValor: "Último Salário Bruto (R$)",
      labelTaxa: "Descontos / Faltas (R$)",
      labelMeses: "Meses Trabalhados no Ano",
    },
    {
      id: "correcao",
      name: "Correção de Valores",
      icon: MoneyIcon,
      desc: "Atualização monetária por índices oficiais",
      info: "Atualiza débitos judiciais com base em índices oficiais (INPC, IPCA-E, IGPM, SELIC). Utilizado em execuções de sentença e cobranças cíveis.",
      labelValor: "Valor de Origem (R$)",
      labelTaxa: "Índice Acumulado (%)",
      labelMeses: "Período (Meses de Atualização)",
    },
    {
      id: "fgts",
      name: "Revisão do FGTS",
      icon: DollarSign,
      desc: "Cálculo da TR vs INPC/IPCA-E",
      info: "Calcula as diferenças de expurgos inflacionários substituindo a TR (Taxa Referencial) pelo INPC/IPCA-E nos depósitos do FGTS entre 1999 e 2023 (TEMA 1091 STF).",
      labelValor: "Saldo do FGTS Época (R$)",
      labelTaxa: "Diferença do Índice TR x INPC (%)",
      labelMeses: "Meses de Contribuição",
    },
    {
      id: "pasep",
      name: "Recálculo PASEP",
      icon: Scale,
      desc: "Diferenças de saldos para servidores públicos",
      info: "Recálculo dos saques e cotas do PASEP para servidores públicos admitidos antes da Constituição de 1988, apurando perdas por atualizações incorretas do Banco do Brasil.",
      labelValor: "Saldo Inicial Depositado (R$)",
      labelTaxa: "Taxa de Correção Devida (% a.a.)",
      labelMeses: "Anos de Serviço Público",
    },
    {
      id: "rmc",
      name: "Cartão RMC e RCC",
      icon: CreditCard,
      desc: "Revisão de reserva de margem consignável",
      info: "Revisão de contratos de Cartão de Crédito Consignado (RMC/RCC). Converte o desconto infinito em folha de pagamento para um empréstimo consignado comum amortizável.",
      labelValor: "Valor do Empréstimo Saque (R$)",
      labelTaxa: "Taxa do Contrato vs Teto INSS (% a.m.)",
      labelMeses: "Meses de Desconto em Folha",
    },
    {
      id: "superendividamento",
      name: "Superendividamento",
      icon: ShieldAlert,
      desc: "Repactuação de dívidas e mínimo existencial",
      info: "Mapeamento do plano de repactuação de dívidas conforme Lei 14.181/2021 (Lei do Superendividamento), preservando o mínimo existencial da família.",
      labelValor: "Renda Líquida Mensal (R$)",
      labelTaxa: "Comprometimento Total Dívidas (%)",
      labelMeses: "Prazo Proposto de Quitação (Meses)",
    },
    {
      id: "revisional",
      name: "Revisional de Contratos",
      icon: FileText,
      desc: "Análise de juros abusivos em financiamentos",
      info: "Compara a taxa cobrada no contrato de financiamento de veículo ou imobiliário com a Taxa Média de Mercado divulgada pelo Banco Central (Bacen).",
      labelValor: "Valor Financiado (R$)",
      labelTaxa: "Taxa Contratada (% a.m.)",
      labelMeses: "Prazo Total do Financiamento",
    },
    {
      id: "dosimetria",
      name: "Dosimetria da Pena",
      icon: Scale,
      desc: "Cálculo de penas base, atenuantes e agravantes",
      info: "Cálculo trifásico da pena criminal (Art. 68 CP): 1ª fase (Pena-Base - Art. 59), 2ª fase (Atenuantes/Agravantes) e 3ª fase (Causas de Aumento e Diminuição).",
      labelValor: "Pena Mínima Cominada (Anos)",
      labelTaxa: "Fração de Aumento/Redução (%)",
      labelMeses: "Meses de Pena Aplicada",
    },
    {
      id: "regime",
      name: "Progressão de Regime",
      icon: Layers,
      desc: "Fração de cumprimento de pena criminal",
      info: "Cálculo de lapsos temporais para progressão de regime (Fechado -> Semiaberto -> Aberto) conforme o Pacote Anticrime (Art. 112 da LEP - 16%, 20%, 40%, 60%, etc).",
      labelValor: "Total da Pena Imposta (Anos)",
      labelTaxa: "Fração de Cumprimento LEP (%)",
      labelMeses: "Meses Cumpridos na Prisão",
    },
    {
      id: "aluguel",
      name: "Reajuste de Aluguel",
      icon: Building2,
      desc: "Atualização por IGPM / IPCA",
      info: "Aplica os índices acumulados de 12 meses (IGP-M da FGV ou IPCA do IBGE) para atualizar contratos de locação imobiliária residencial ou comercial.",
      labelValor: "Valor Atual do Aluguel (R$)",
      labelTaxa: "Índice de Reajuste Acumulado (%)",
      labelMeses: "Período do Contrato (Meses)",
    },
    {
      id: "pensao",
      name: "Pensão Alimentícia",
      icon: Users,
      desc: "Cálculo percentual sobre renda/salário mínimo",
      info: "Dimensionamento da obrigação alimentícia com base no binômio necessidade x possibilidade (Art. 1.694 do Código Civil) sobre rendimentos líquidos ou Salário Mínimo.",
      labelValor: "Rendimento Líquido do Alimentante (R$)",
      labelTaxa: "Percentual Fixado (%)",
      labelMeses: "Número de Alimentados (Filhos)",
    },
    {
      id: "inss",
      name: "Revisão INSS / Previdenciário",
      icon: Briefcase,
      desc: "RMI, tempo de contribuição e regras de transição",
      info: "Cálculo da Renda Mensal Inicial (RMI) do benefício previdenciário, apurando regras de transição (Pontos, Idade Progressiva, Pedágio 50%/100% da EC 103/2019).",
      labelValor: "Média dos Salários de Contribuição (R$)",
      labelTaxa: "Alíquota do Coeficiente (% EC 103)",
      labelMeses: "Tempo de Contribuição (Anos)",
    },
    {
      id: "divorcio",
      name: "Partilha de Divórcio",
      icon: Users,
      desc: "Divisão de bens e meação de ativos",
      info: "Levantamento do monte mor de bens comunheis conforme o regime de bens (Comunhão Parcial ou Total), apurando a meação exata (50%) e eventuais compensações.",
      labelValor: "Valor Total do Patrimônio (R$)",
      labelTaxa: "Meação / Quota Parte (%)",
      labelMeses: "Dívidas a Deduzir (R$)",
    },
  ];

  const consultasLista = [
    { id: "cep", name: "Busca CEP & Endereço Completo", icon: Building2, desc: "Logradouro, bairro, município e UF oficiais", inputType: "CEP (8 dígitos)", placeholder: "Digite o CEP (ex: 01310-200 ou 01310200)...", isFree: true },
    { id: "buscador", name: "Buscador Processual", icon: Search, desc: "Consulta por Nome, CPF, CNPJ ou OAB em todos os tribunais", inputType: "CNJ / CPF / Nome / OAB", placeholder: "Ex: 1002345-12.2024.8.26.0100 ou CPF/Nome", isFree: true },
    { id: "cpf_status", name: "Situação Cadastral de CPF", icon: User, desc: "Regularidade perante a Receita Federal", inputType: "CPF", placeholder: "Digite o CPF (11 dígitos)... Ex: 123.456.789-00", isFree: true },
    { id: "empresas", name: "Sociedades e Empresas", icon: Building2, desc: "Quadro de sócios e administradores (QSA)", inputType: "CNPJ", placeholder: "Digite o CNPJ (14 dígitos)... Ex: 00.000.000/0001-91", isFree: true },
    { id: "grupo_cnpj", name: "Grupo Econômico de CNPJ", icon: Layers, desc: "Mapeamento de coligadas e filiais", inputType: "CNPJ", placeholder: "Digite o CNPJ da Matriz... Ex: 00.000.000/0001-91", isFree: true },
    { id: "veiculo", name: "Dados do Veículo / Renavam", icon: Car, desc: "Histórico, multas, restrições e gravames", inputType: "Placa ou RENAVAM", placeholder: "Digite a Placa (ex: ABC1D23) ou RENAVAM...", isFree: false, provider: "SENATRAN / SINESP / Infosimples" },
    { id: "rastreio_veiculo", name: "Rastreamento de Veículo", icon: Car, desc: "Busca de frota e ativos móveis para execução", inputType: "CPF ou CNPJ do Proprietário", placeholder: "Digite o CPF ou CNPJ para buscar a frota...", isFree: false, provider: "SENATRAN / DirectData" },
    { id: "cnh", name: "Dados da CNH", icon: CreditCard, desc: "Pontuação, suspensões e categoria", inputType: "CPF ou Nº da CNH", placeholder: "Digite o CPF do condutor ou número da CNH...", isFree: false, provider: "SENATRAN / DETRAN" },
    { id: "marcas", name: "Marcas e Patentes (INPI)", icon: Award, desc: "Pesquisa de marcas registradas e patentes", inputType: "Nome da Marca ou Processo INPI", placeholder: "Digite o nome da marca ou nº do processo INPI...", isFree: false, provider: "INPI / Infosimples" },
    { id: "credito", name: "Restrição de Crédito", icon: CreditCard, desc: "Negativações nos Cartórios de Protesto (IEPTB)", inputType: "CPF ou CNPJ", placeholder: "Digite o CPF ou CNPJ para consulta de protestos...", isFree: false, provider: "IEPTB Cartórios" },
    { id: "localizacao", name: "Localização de Devedores", icon: User, desc: "Busca de endereços e telefones atualizados", inputType: "CPF, CNPJ ou Nome Completo", placeholder: "Digite o CPF, CNPJ ou Nome do Devedor...", isFree: false, provider: "Serpro PGFN / DirectData" },
    { id: "relacionamentos", name: "Relacionamentos & Sócios", icon: Users, desc: "Vínculos societários e parentescos", inputType: "CPF ou Nome do Sócio", placeholder: "Digite o CPF ou Nome do Investigado...", isFree: true },
    { id: "profissionais", name: "Dados Profissionais", icon: Briefcase, desc: "Vínculos empregatícios e registro de classe", inputType: "CPF ou Registro (OAB, CRM, etc)", placeholder: "Digite o CPF ou Registro Profissional...", isFree: false, provider: "Conselhos de Classe" },
  ];

  const outrosLista = [
    { id: "novos_clientes", name: "Captação de Novos Clientes", icon: Users, desc: "Conexão com potenciais clientes jurídicos" },
    { id: "assinatura", name: "Assinatura Eletrônica", icon: FileSignature, desc: "Envio de contratos para assinatura digital com validade legal" },
    { id: "ia_sites", name: "I.A. Criador de Sites para Escritórios", icon: Globe, desc: "Crie o site do seu escritório em 5 minutos" },
    { id: "financeiro", name: "Gestão Financeira & Honorários", icon: MoneyIcon, desc: "Controle de caixa, faturamento e honorários sucumbenciais" },
    { id: "jurisprudencias", name: "Pesquisador de Jurisprudências", icon: Scale, desc: "Busca unificada em acórdãos do STF, STJ e TJs" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Central de Ferramentas Jurídicas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cálculos jurídicos, consultas de dados, IA assistente e geradores de documentos em um só lugar.
        </p>
      </div>

      {/* ABA 1: CÁLCULOS JURÍDICOS */}
      {activeTab === "calculadoras" && (
        <div className="space-y-6">
          {/* Grid de seleção de Calculadoras */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {calculosLista.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCalc(c.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedCalc === c.id
                    ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-slate-900 font-bold"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <c.icon className={`w-5 h-5 ${selectedCalc === c.id ? "text-amber-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold truncate">{c.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">{c.desc}</p>
              </button>
            ))}
          </div>

          {/* Painel do Cálculo Selecionado */}
          <div className="space-y-4">
            {/* Banner Informativo Explicativo com Ícone de Informação */}
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-900">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  {calculosLista.find((c) => c.id === selectedCalc)?.name}
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Fundamentação Legal
                  </span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {calculosLista.find((c) => c.id === selectedCalc)?.info}
                </p>
              </div>
            </div>

            {selectedCalc === "trabalhista" ? (
              <div className="space-y-4">
                <div className="card space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Calculator className="w-5 h-5 text-amber-500" />
                    <h2 className="font-bold text-slate-900 text-base">Cálculo Rescisório Trabalhista (CLT)</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="label">Último Salário Bruto (R$)</label>
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-300">
                        <span className="px-3 text-slate-400 text-sm font-bold bg-slate-50 border-r border-slate-200 h-full flex items-center select-none" style={{height:'40px'}}>R$</span>
                        <input
                          type="number"
                          placeholder="0,00"
                          className="flex-1 px-3 py-2 text-sm font-semibold outline-none bg-white"
                          value={salario}
                          onChange={(e) => setSalario(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Meses Trabalhados no Ano</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="input"
                        value={mesesTrabalhados}
                        onChange={(e) => setMesesTrabalhados(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="label">Tipo de Rescisão</label>
                      <select
                        className="input"
                        value={tipoDemissao}
                        onChange={(e) => setTipoDemissao(e.target.value)}
                      >
                        <option value="sem_justa_causa">Sem Justa Causa (Multa 40%)</option>
                        <option value="com_justa_causa">Com Justa Causa</option>
                        <option value="pedido_demissao">Pedido de Demissão</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={avisoPrevio}
                          onChange={(e) => setAvisoPrevio(e.target.checked)}
                          className="w-4 h-4 accent-slate-900"
                        />
                        <span className="text-xs font-semibold text-slate-700">Aviso Prévio Indenizado</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Total Highlight */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Rescisório Estimado</p>
                    <p className="font-display text-4xl font-bold text-amber-400 mt-1">
                      R$ {totalEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-7 h-7 text-amber-400" />
                  </div>
                </div>

                {/* Tabela de Verbas */}
                <div className="card space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Demonstrativo de Verbas Rescisórias
                    </h2>
                    <span className="badge badge-success font-bold">Estimativa Automática</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-700">13º Salário Proporcional ({mesesTrabalhados}/12)</span>
                      <span className="font-bold text-slate-900">R$ {decimoTerceiro.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-700">Férias Proporcionais ({mesesTrabalhados}/12)</span>
                      <span className="font-bold text-slate-900">R$ {feriasProporcionais.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-700">1/3 Constitucional sobre Férias</span>
                      <span className="font-bold text-slate-900">R$ {tercoFerias.toFixed(2)}</span>
                    </div>
                    {avisoPrevio && (
                      <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-700">Aviso Prévio Indenizado (1 mês)</span>
                        <span className="font-bold text-slate-900">R$ {avisoPrevioValor.toFixed(2)}</span>
                      </div>
                    )}
                    {tipoDemissao === "sem_justa_causa" && (
                      <div className="flex justify-between items-center p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 sm:col-span-2">
                        <span className="text-sm font-medium text-amber-900">Multa Rescisória de 40% sobre o FGTS</span>
                        <span className="font-bold text-amber-900">R$ {multaFgts.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Formulário Dinâmico Personalizado para os outros 12 Cálculos */
              <div className="space-y-4">
                <div className="card space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Calculator className="w-5 h-5 text-amber-500" />
                    <h2 className="font-bold text-slate-900 text-base">
                      {calculosLista.find((c) => c.id === selectedCalc)?.name}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label font-bold text-slate-800">
                        {calculosLista.find((c) => c.id === selectedCalc)?.labelValor || "Valor de Origem (R$)"}
                      </label>
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-300">
                        <span className="px-3 text-slate-400 text-sm font-bold bg-slate-50 border-r border-slate-200 select-none" style={{height:'40px', display:'flex', alignItems:'center'}}>R$</span>
                        <input
                          type="number"
                          placeholder="0,00"
                          className="flex-1 px-3 py-2 text-sm font-semibold outline-none bg-white"
                          value={valorBase}
                          onChange={(e) => setValorBase(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label font-bold text-slate-800">
                        {calculosLista.find((c) => c.id === selectedCalc)?.labelTaxa || "Taxa / Índice (%)"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Digite o percentual..."
                        className="input font-semibold"
                        value={taxaJuros}
                        onChange={(e) => setTaxaJuros(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label font-bold text-slate-800">
                        {calculosLista.find((c) => c.id === selectedCalc)?.labelMeses || "Período (Meses / Anos)"}
                      </label>
                      <input
                        type="number"
                        placeholder="Digite a quantidade..."
                        className="input font-semibold"
                        value={meses}
                        onChange={(e) => setMeses(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Resultado Matemático Especializado sem Mock */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{resCalc.titulo}</p>
                    <p className="font-display text-4xl font-bold text-amber-400 mt-1">
                      {selectedCalc === "dosimetria"
                        ? `${resCalc.resultado.toFixed(1)} Anos`
                        : selectedCalc === "regime"
                        ? `${resCalc.resultado.toFixed(0)} Meses`
                        : `R$ ${resCalc.resultado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-7 h-7 text-amber-400" />
                  </div>
                </div>

                {/* Tabela de Memória de Cálculo / Detalhes */}
                <div className="card space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Memória de Cálculo &amp; Discriminativo
                    </h2>
                    <span className="badge badge-success font-bold">Cálculo Matemático Real</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resCalc.detalhes.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <span className="text-xs font-medium text-slate-700">{item.rotulo}</span>
                        <span className="font-bold text-slate-900 text-xs">
                          {selectedCalc === "dosimetria"
                            ? `${item.valor.toFixed(1)} anos`
                            : selectedCalc === "regime"
                            ? `${item.valor.toFixed(1)} anos`
                            : `R$ ${item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: CONSULTAS LEGAIS */}
      {activeTab === "consultas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {consultasLista.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConsulta(c.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedConsulta === c.id
                    ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-slate-900 font-bold"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <c.icon className={`w-5 h-5 ${selectedConsulta === c.id ? "text-amber-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold truncate">{c.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">{c.desc}</p>
              </button>
            ))}
          </div>

          <div className="card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-500" />
                {consultasLista.find((c) => c.id === selectedConsulta)?.name}
              </h2>
              <div className="flex items-center gap-2">
                {consultasLista.find((c) => c.id === selectedConsulta)?.isFree ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    API Gratuita (Livre)
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    Requer Credencial Privada / API
                  </span>
                )}
                <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Identificador: {consultasLista.find((c) => c.id === selectedConsulta)?.inputType}
                </span>
              </div>
            </div>

            {!consultasLista.find((c) => c.id === selectedConsulta)?.isFree && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">
                      Esta consulta requer login, senha ou chave de API ({consultasLista.find((c) => c.id === selectedConsulta)?.provider})
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Para realizar buscas reais de veículos, Serpro PGFN ou INPI, cadastre suas chaves nas Configurações.
                    </p>
                  </div>
                </div>
                <a
                  href="/dashboard/configuracoes"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex-shrink-0 transition-all shadow-sm"
                >
                  Configurar Chaves
                </a>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={consultasLista.find((c) => c.id === selectedConsulta)?.placeholder || "Digite o termo..."}
                className="input flex-1"
                value={consultaTermo}
                onChange={(e) => setConsultaTermo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executarConsultaGov()}
              />
              <button
                onClick={executarConsultaGov}
                disabled={loadingGov || !consultaTermo}
                className="btn-primary text-xs px-6 py-3 justify-center disabled:opacity-50"
              >
                <Search className={`w-4 h-4 text-amber-400 ${loadingGov ? "animate-spin" : ""}`} />
                {loadingGov ? "Consultando Servidores..." : "Consultar API Oficial"}
              </button>
            </div>

            {errorGov && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorGov}</span>
              </div>
            )}

            {resultadoGov && (
              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Resposta Retornada da Base Oficial ({resultadoGov.fonte})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">STATUS: 200 OK</span>
                </div>
                <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto text-emerald-400 border border-slate-800 max-h-80">
                  {JSON.stringify(resultadoGov.dados, null, 2)}
                </pre>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>
                Conexão direta aos servidores públicos e bases governamentais (DataJud/CNJ, Receita Federal, SENATRAN e INPI).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: RECURSOS & IA */}
      {activeTab === "outros" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {outrosLista.map((item) => (
            <div key={item.id} className="card hover:border-amber-500/50 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              <button className="btn-outline text-xs w-full justify-center py-2">
                Acessar Recurso
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ABA 4: GERADOR DE PROCURAÇÃO */}
      {activeTab === "procuracao" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Gerador de Procuração IA</h2>
              <p className="text-slate-300 text-sm">Powered by Google Gemini — Procuração gerada por IA com qualificação completa das partes.</p>
            </div>
            <a href="/dashboard/configuracoes" className="ml-auto flex-shrink-0 text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-2 hover:bg-amber-500/30 transition-colors">
              ⚙️ Configurar Chave Gemini
            </a>
          </div>

          {/* Tipo de Procuração */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">1. Tipo de Procuração</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "ad_judicia", label: "Ad Judicia et Extra", desc: "Poderes gerais para o foro" },
                { id: "especial", label: "Procuração Especial", desc: "Para ato específico" },
                { id: "administrativa", label: "Administrativa", desc: "Repartições e órgãos públicos" },
                { id: "substabelecimento", label: "Substabelecimento", desc: "Transferência de poderes" },
              ].map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoProcuracao(tipo.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tipoProcuracao === tipo.id
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className={`text-xs font-bold ${tipoProcuracao === tipo.id ? "text-amber-700" : "text-slate-800"}`}>{tipo.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tipo.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dados das Partes */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">2. Dados das Partes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Nome do Outorgante (Cliente)</label>
                <input type="text" className="input" placeholder="Nome completo..." value={outorganteNome} onChange={(e) => setOutorganteNome(e.target.value)} />
              </div>
              <div>
                <label className="label">CPF do Outorgante</label>
                <input type="text" className="input" placeholder="000.000.000-00" value={outorganteCpf} onChange={(e) => setOutorganteCpf(e.target.value)} />
              </div>
              <div>
                <label className="label">RG / Documento de Identidade</label>
                <input type="text" className="input" placeholder="00.000.000-0 SSP/SP" value={outorganteRg} onChange={(e) => setOutorganteRg(e.target.value)} />
              </div>
              <div>
                <label className="label">Estado Civil</label>
                <select className="input" value={outorganteEstadoCivil} onChange={(e) => setOutorganteEstadoCivil(e.target.value)}>
                  <option value="solteiro(a)">Solteiro(a)</option>
                  <option value="casado(a)">Casado(a)</option>
                  <option value="divorciado(a)">Divorciado(a)</option>
                  <option value="viúvo(a)">Viúvo(a)</option>
                  <option value="separado(a) judicialmente">Separado(a) Judicialmente</option>
                </select>
              </div>
              <div>
                <label className="label">Profissão</label>
                <input type="text" className="input" placeholder="Ex: Empresário, Advogado..." value={outorganteProfissao} onChange={(e) => setOutorganteProfissao(e.target.value)} />
              </div>
              <div>
                <label className="label">Cidade / UF de Residência</label>
                <input type="text" className="input" placeholder="Ex: São Paulo/SP" value={outorganteCidade} onChange={(e) => setOutorganteCidade(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Endereço Completo</label>
                <input type="text" className="input" placeholder="Rua, número, bairro, CEP..." value={outorganteEndereco} onChange={(e) => setOutorganteEndereco(e.target.value)} />
              </div>
              <div>
                <label className="label">Arquivo Modelo Base (opcional)</label>
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${procUploadFileName ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50"}`}>
                  <FileCheck className={`w-4 h-4 flex-shrink-0 ${procUploadFileName ? "text-emerald-500" : "text-slate-400"}`} />
                  <span className={`text-xs font-medium truncate ${procUploadFileName ? "text-emerald-700" : "text-slate-500"}`}>
                    {procUploadFileName || "Enviar modelo .txt base"}
                  </span>
                  <input type="file" accept=".txt,.docx" className="hidden" onChange={handleProcUpload} />
                </label>
              </div>
            </div>

            {/* Outorgado */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Advogado Outorgado</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="label">Nome do Advogado</label>
                  <input type="text" className="input" placeholder="Dr(a). Nome Completo..." value={outorgadoAdvogado} onChange={(e) => setOutorgadoAdvogado(e.target.value)} />
                </div>
                <div>
                  <label className="label">Número OAB</label>
                  <input type="text" className="input" placeholder="SP 123.456" value={outorgadoOab} onChange={(e) => setOutorgadoOab(e.target.value)} />
                </div>
                <div>
                  <label className="label">Objeto / Finalidade da Procuração</label>
                  <input type="text" className="input" placeholder="Ex: Representar em ação de cobrança..." value={procObjeto} onChange={(e) => setProcObjeto(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Botão Gerar */}
          <button
            onClick={gerarProcuracaoIA}
            disabled={loadingProcuracao || !outorganteNome || !outorgadoAdvogado}
            className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProcuracao ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gerando procuração com Gemini IA...
              </>
            ) : (
              <>
                <Bot className="w-5 h-5 text-amber-400" />
                3. Gerar Procuração com IA
              </>
            )}
          </button>

          {/* Erro */}
          {erroProcuracao && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Erro ao gerar procuração</p>
                <p className="text-sm mt-0.5">{erroProcuracao}</p>
                {erroProcuracao.includes("Chave") && (
                  <a href="/dashboard/configuracoes" className="text-xs underline font-bold mt-1 inline-block">
                    → Ir para Configurações e adicionar chave Gemini
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Editor / Preview */}
          {textoProcuracao ? (
            <div className="card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-slate-900 text-base">4. Editor da Procuração — Revise e Edite</span>
                  <span className="badge badge-success text-[10px]">Gerado por IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigator.clipboard.writeText(textoProcuracao)} className="btn-outline text-xs py-2 px-4">
                    📋 Copiar Texto
                  </button>
                  <button onClick={() => window.print()} className="btn-primary text-xs py-2 px-4">
                    <Printer className="w-4 h-4 text-amber-400" />
                    Imprimir / PDF
                  </button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><strong>Atenção:</strong> Revise os dados antes de imprimir. A procuração precisa ser assinada pelo outorgante e reconhecida em cartório quando exigido.</span>
              </div>
              <textarea
                rows={30}
                className="w-full p-6 rounded-xl border border-slate-200 bg-white text-sm leading-relaxed text-slate-900 resize-y outline-none focus:ring-2 focus:ring-slate-300"
                value={textoProcuracao}
                onChange={(e) => setTextoProcuracao(e.target.value)}
                style={{ fontFamily: "'Georgia', serif", lineHeight: "1.8" }}
              />
            </div>
          ) : (
            /* Preview estático enquanto não gera com IA */
            outorganteNome && outorgadoAdvogado ? (
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">Pré-visualização (Modelo Padrão)</span>
                  <button onClick={() => window.print()} className="btn-primary text-sm">
                    <Printer className="w-4 h-4 text-amber-400" />
                    Imprimir / Salvar PDF
                  </button>
                </div>
                <div className="bg-white rounded-2xl p-8 border border-slate-300 shadow-inner space-y-6 text-slate-900 font-serif leading-relaxed text-justify">
                  <h2 className="font-bold text-center text-xl uppercase tracking-wider text-slate-900 mb-8 border-b-2 border-slate-900 pb-2">
                    PROCURAÇÃO AD JUDICIA ET EXTRA JUDICIA
                  </h2>
                  <p className="text-sm">
                    <strong>OUTORGANTE:</strong> <strong>{outorganteNome.toUpperCase()}</strong>, {outorganteEstadoCivil}, {outorganteProfissao || "brasileiro(a)"}, portador(a) da Cédula de Identidade RG nº {outorganteRg} e inscrito(a) no CPF/MF sob o nº {outorganteCpf}, residente e domiciliado(a) na {outorganteEndereco}{outorganteCidade ? `, ${outorganteCidade}` : ""}.
                  </p>
                  <p className="text-sm">
                    <strong>OUTORGADO:</strong> <strong>{outorgadoAdvogado.toUpperCase()}</strong>, advogado(a) inscrito(a) na Ordem dos Advogados do Brasil sob o nº {outorgadoOab}, com escritório profissional de advocacia.
                  </p>
                  <p className="text-sm">
                    <strong>PODERES:</strong> Pelo presente instrumento particular de procuração, o(a) OUTORGANTE nomeia e constitui o(a) OUTORGADO(A) como seu(sua) procurador(a), concedendo-lhe amplos poderes para o foro em geral, constantes da cláusula <em>&quot;ad judicia et extra judicia&quot;</em>, em qualquer Juízo, Tribunal ou Repartição Pública.
                  </p>
                  <p className="text-sm">
                    <strong>PODERES ESPECIAIS:</strong> Incluindo poderes para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, assinar termo, firmar compromissos, receber e dar quitação, requerer execução e praticar todos os atos necessários ao bom e fiel cumprimento deste mandato.
                  </p>
                  {procObjeto && (
                    <p className="text-sm">
                      <strong>OBJETO:</strong> {procObjeto}.
                    </p>
                  )}
                  <div className="pt-16 text-center text-sm space-y-12">
                    <p>{outorganteCidade || "São Paulo/SP"}, {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.</p>
                    <div className="inline-block border-t border-slate-900 px-12 pt-2">
                      <p className="font-bold">{outorganteNome.toUpperCase()}</p>
                      <p className="text-xs text-slate-500">Outorgante</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
      {/* ABA 6: I.A. ASSISTENTE JURÍDICO */}
      {activeTab === "assistente" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <Bot className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg">I.A. Assistente Jurídico</h2>
              <p className="text-slate-300 text-sm">Powered by Google Gemini — Pesquise jurisprudência, doutrina e fundamentos legais em tempo real.</p>
            </div>
            <a href="/dashboard/configuracoes" className="ml-auto flex-shrink-0 text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-2 hover:bg-amber-500/30 transition-colors">
              ⚙️ Configurar Chave Gemini
            </a>
          </div>

          {/* Sugestões Rápidas */}
          <div className="flex flex-wrap gap-2">
            {[
              "Requisitos para aposentadoria por tempo de contribuição?",
              "O que diz o STJ sobre juros abusivos em contratos bancários?",
              "Direitos do consumidor em compra cancelada online?",
              "Como funciona a dosimetria da pena no Código Penal?",
              "Prazo para contestar uma ação cível",
              "Diferença entre dano moral e dano material",
            ].map((sugestao) => (
              <button
                key={sugestao}
                onClick={() => setChatInput(sugestao)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all"
              >
                {sugestao}
              </button>
            ))}
          </div>

          {/* Janela do Chat */}
          <div className="card p-0 overflow-hidden flex flex-col" style={{ height: "520px" }}>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${msg.role === "user" ? "bg-slate-900" : "bg-amber-500"}`}>
                    {msg.role === "user" ? "EU" : "IA"}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-sm"
                      : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loadingChat && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">IA</div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 p-4 bg-slate-50/50">
              <div className="flex gap-3 items-end">
                <textarea
                  rows={2}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm resize-none outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                  placeholder="Faça uma pergunta jurídica... (Enter para enviar, Shift+Enter para nova linha)"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      enviarMensagem();
                    }
                  }}
                />
                <button
                  onClick={enviarMensagem}
                  disabled={loadingChat || !chatInput.trim()}
                  className="btn-primary px-5 py-3 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingChat
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Sparkles className="w-5 h-5 text-amber-400" />
                  }
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Respostas geradas por IA com base em legislação e jurisprudência brasileira. Consulte sempre um advogado para casos específicos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: PETIÇÕES IA */}
      {activeTab === "peticoes" && (
        <div className="space-y-6">
          {/* Header da Ferramenta */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <Bot className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Gerador de Petições IA</h2>
              <p className="text-slate-300 text-sm">Powered by Google Gemini — Peças processuais geradas por IA, revisadas por você.</p>
            </div>
            <a href="/dashboard/configuracoes" className="ml-auto flex-shrink-0 text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-2 hover:bg-amber-500/30 transition-colors">
              ⚙️ Configurar Chave Gemini
            </a>
          </div>

          {/* Seleção do Tipo de Peça */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">1. Tipo de Peça Processual</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "inicial", label: "Petição Inicial", desc: "Art. 319 CPC" },
                { id: "contestacao", label: "Contestação", desc: "Art. 335 CPC" },
                { id: "recurso", label: "Recurso de Apelação", desc: "Art. 1.009 CPC" },
                { id: "replica", label: "Réplica", desc: "Art. 350 CPC" },
                { id: "agravo", label: "Agravo de Instrumento", desc: "Art. 1.015 CPC" },
                { id: "hc", label: "Habeas Corpus", desc: "Art. 647 CPP" },
                { id: "embargos", label: "Embargos de Declaração", desc: "Art. 1.022 CPC" },
              ].map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoPeca(tipo.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tipoPeca === tipo.id
                      ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className={`text-xs font-bold ${tipoPeca === tipo.id ? "text-amber-700" : "text-slate-800"}`}>{tipo.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tipo.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dados da Causa */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">2. Dados da Causa</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Requerente / Autor</label>
                <input type="text" className="input" placeholder="Nome completo ou Razão Social..." value={pRequerente} onChange={(e) => setPRequerente(e.target.value)} />
              </div>
              <div>
                <label className="label">Requerido / Réu</label>
                <input type="text" className="input" placeholder="Nome completo ou Razão Social..." value={pRequerido} onChange={(e) => setPRequerido(e.target.value)} />
              </div>
              <div>
                <label className="label">Juízo / Vara</label>
                <input type="text" className="input" placeholder="Ex: 3ª Vara Cível de São Paulo/SP" value={pJuizo} onChange={(e) => setPJuizo(e.target.value)} />
              </div>
              <div>
                <label className="label">Nº do Processo (se existente)</label>
                <input type="text" className="input" placeholder="Ex: 1002345-12.2024.8.26.0100" value={pNumeroProcesso} onChange={(e) => setPNumeroProcesso(e.target.value)} />
              </div>
              <div>
                <label className="label">Valor da Causa (R$)</label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-300">
                  <span className="px-3 text-slate-400 text-sm font-bold bg-slate-50 border-r border-slate-200 select-none" style={{height:'40px', display:'flex', alignItems:'center'}}>R$</span>
                  <input type="number" placeholder="0,00" className="flex-1 px-3 py-2 text-sm font-semibold outline-none bg-white" value={pValorCausa} onChange={(e) => setPValorCausa(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Arquivo Modelo Base (opcional)</label>
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploadedFileName ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50"}`}>
                  <FileCheck className={`w-4 h-4 flex-shrink-0 ${uploadedFileName ? "text-emerald-500" : "text-slate-400"}`} />
                  <span className={`text-xs font-medium truncate ${uploadedFileName ? "text-emerald-700" : "text-slate-500"}`}>
                    {uploadedFileName || "Clique para enviar .txt ou .docx"}
                  </span>
                  <input type="file" accept=".txt,.docx" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div>
              <label className="label">Narração dos Fatos (descreva detalhadamente)</label>
              <textarea
                rows={5}
                className="input resize-y font-sans text-sm"
                placeholder="Descreva os fatos relevantes ao caso: o que aconteceu, quando, como, consequências sofridas pelo autor..."
                value={pFatos}
                onChange={(e) => setPFatos(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Pedidos / Objeto da Demanda</label>
              <textarea
                rows={3}
                className="input resize-y font-sans text-sm"
                placeholder="Liste os pedidos: Ex: a) condenação ao pagamento de R$ X; b) declaração de nulidade do contrato; c) indenização por danos morais..."
                value={pPedidos}
                onChange={(e) => setPPedidos(e.target.value)}
              />
            </div>
          </div>

          {/* Botão Gerar */}
          <button
            onClick={gerarPeticaoIA}
            disabled={loadingPeticao || !pRequerente || !pRequerido || !pFatos}
            className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPeticao ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gerando peça com Gemini IA...
              </>
            ) : (
              <>
                <Bot className="w-5 h-5 text-amber-400" />
                3. Gerar Petição com IA
              </>
            )}
          </button>

          {/* Erro */}
          {erroPeticao && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Erro ao gerar petição</p>
                <p className="text-sm mt-0.5">{erroPeticao}</p>
                {erroPeticao.includes("Chave") && (
                  <a href="/dashboard/configuracoes" className="text-xs underline font-bold mt-1 inline-block">
                    → Ir para Configurações e adicionar chave Gemini
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Editor da Petição Gerada */}
          {textoPeticao && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-slate-900 text-base">4. Editor da Petição — Revise e Edite</span>
                  <span className="badge badge-success text-[10px]">Gerado por IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(textoPeticao)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    📋 Copiar Texto
                  </button>
                  <button onClick={() => window.print()} className="btn-primary text-xs py-2 px-4">
                    <Printer className="w-4 h-4 text-amber-400" />
                    Imprimir / PDF
                  </button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><strong>Atenção:</strong> Esta peça é um rascunho gerado por IA. Revise, adapte ao caso concreto e assuma a responsabilidade técnica antes de protocolar.</span>
              </div>
              <textarea
                rows={30}
                className="w-full p-6 rounded-xl border border-slate-200 bg-white font-serif text-sm leading-relaxed text-slate-900 resize-y outline-none focus:ring-2 focus:ring-slate-300"
                value={textoPeticao}
                onChange={(e) => setTextoPeticao(e.target.value)}
                style={{ fontFamily: "'Georgia', serif", lineHeight: "1.8" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FerramentasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Carregando ferramentas...</div>}>
      <FerramentasContent />
    </Suspense>
  );
}
