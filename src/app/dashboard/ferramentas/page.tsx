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
} from "lucide-react";

function FerramentasContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "calculadoras" | "consultas" | "outros" | "procuracao" | null;
  const [activeTab, setActiveTab] = useState<"calculadoras" | "consultas" | "outros" | "procuracao">("calculadoras");

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

  const [valorBase, setValorBase] = useState<string>("10000");
  const [taxaJuros, setTaxaJuros] = useState<string>("1");
  const [meses, setMeses] = useState<string>("12");
  const [consultaTermo, setConsultaTermo] = useState<string>("");

  // Governamental API state
  const [loadingGov, setLoadingGov] = useState<boolean>(false);
  const [resultadoGov, setResultadoGov] = useState<any>(null);
  const [errorGov, setErrorGov] = useState<string>("");

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

  // Cálculo Genérico (Juros / Revisional / Correção)
  const val = parseFloat(valorBase) || 0;
  const tx = parseFloat(taxaJuros) || 0;
  const m = parseInt(meses) || 0;
  const totalCorrigido = val * Math.pow(1 + tx / 100, m);

  const calculosLista = [
    { id: "trabalhista", name: "Trabalhista (CLT)", icon: Calculator, desc: "Rescisão, saldo de salário, 13º e Férias" },
    { id: "correcao", name: "Correção de Valores", icon: MoneyIcon, desc: "Atualização monetária por índices oficiais" },
    { id: "fgts", name: "Revisão do FGTS", icon: DollarSign, desc: "Cálculo da TR vs INPC/IPCA-E" },
    { id: "pasep", name: "Recálculo PASEP", icon: Scale, desc: "Diferenças de saldos para servidores públicos" },
    { id: "rmc", name: "Cartão RMC e RCC", icon: CreditCard, desc: "Revisão de reserva de margem consignável" },
    { id: "superendividamento", name: "Superendividamento", icon: ShieldAlert, desc: "Repactuação de dívidas e mínimo existencial" },
    { id: "revisional", name: "Revisional de Contratos", icon: FileText, desc: "Análise de juros abusivos em financiamentos" },
    { id: "dosimetria", name: "Dosimetria da Pena", icon: Scale, desc: "Cálculo de penas base, atenuantes e agravantes" },
    { id: "regime", name: "Progressão de Regime", icon: Layers, desc: "Fração de cumprimento de pena criminal" },
    { id: "aluguel", name: "Reajuste de Aluguel", icon: Building2, desc: "Atualização por IGPM / IPCA" },
    { id: "pensao", name: "Pensão Alimentícia", icon: Users, desc: "Cálculo percentual sobre renda/salário mínimo" },
    { id: "inss", name: "Revisão INSS / Previdenciário", icon: Briefcase, desc: "RMI, tempo de contribuição e regras de transição" },
    { id: "divorcio", name: "Partilha de Divórcio", icon: Users, desc: "Divisão de bens e meação de ativos" },
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
    { id: "monitoramento", name: "Monitoramento de Processos", icon: Search, desc: "Alertas automáticos a cada movimentação" },
    { id: "assinatura", name: "Assinatura Eletrônica", icon: FileSignature, desc: "Envio de contratos para assinatura digital com validade legal" },
    { id: "peticoes", name: "Gerador de Petições IA", icon: FileText, desc: "Modelos inteligentes de peças processuais" },
    { id: "ia_assistente", name: "I.A. Assistente Jurídico", icon: Bot, desc: "Chat inteligente para pesquisas de doutrina e jurisprudência" },
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
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                      <input
                        type="number"
                        className="input pl-9"
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
            /* Formulário Dinâmico Genérico para os outros 12 Cálculos */
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
                    <label className="label">Valor de Origem / Base (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                      <input
                        type="number"
                        className="input pl-9"
                        value={valorBase}
                        onChange={(e) => setValorBase(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Taxa / Índice Aplicado (% a.m.)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      value={taxaJuros}
                      onChange={(e) => setTaxaJuros(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Período (Meses / Parcelas)</label>
                    <input
                      type="number"
                      className="input"
                      value={meses}
                      onChange={(e) => setMeses(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Resultado Genérico */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Valor Atualizado Estimado</p>
                  <p className="font-display text-4xl font-bold text-amber-400 mt-1">
                    R$ {totalCorrigido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Diferença/Ganho: R$ {(totalCorrigido - val).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-7 h-7 text-amber-400" />
                </div>
              </div>
            </div>
          )}
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
        <div className="space-y-4">
          {/* Dados das Partes */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">Dados das Partes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Nome do Cliente (Outorgante)</label>
                <input type="text" className="input" value={outorganteNome} onChange={(e) => setOutorganteNome(e.target.value)} />
              </div>
              <div>
                <label className="label">CPF do Cliente</label>
                <input type="text" className="input" value={outorganteCpf} onChange={(e) => setOutorganteCpf(e.target.value)} />
              </div>
              <div>
                <label className="label">RG do Cliente</label>
                <input type="text" className="input" value={outorganteRg} onChange={(e) => setOutorganteRg(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Endereço Completo</label>
                <input type="text" className="input" value={outorganteEndereco} onChange={(e) => setOutorganteEndereco(e.target.value)} />
              </div>
              <div>
                <label className="label">Advogado (Outorgado)</label>
                <input type="text" className="input" value={outorgadoAdvogado} onChange={(e) => setOutorgadoAdvogado(e.target.value)} />
              </div>
              <div>
                <label className="label">OAB do Advogado</label>
                <input type="text" className="input" value={outorgadoOab} onChange={(e) => setOutorgadoOab(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Minuta Gerada */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-base">Visualização do Documento</span>
              <button
                onClick={() => window.print()}
                className="btn-primary text-sm"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Imprimir / Salvar PDF
              </button>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-300 shadow-inner space-y-6 text-slate-900 font-serif leading-relaxed text-justify">
              <h2 className="font-bold text-center text-xl uppercase tracking-wider text-slate-900 mb-8 border-b-2 border-slate-900 pb-2">
                PROCURAÇÃO AD JUDICIA ET EXTRA JUDICIA
              </h2>
              <p className="text-sm">
                <strong>OUTORGANTE:</strong> <strong>{outorganteNome.toUpperCase()}</strong>, brasileiro(a), portador(a) da Cédula de Identidade RG nº {outorganteRg} e inscrito(a) no CPF/MF sob o nº {outorganteCpf}, residente e domiciliado(a) na {outorganteEndereco}.
              </p>
              <p className="text-sm">
                <strong>OUTORGADO:</strong> <strong>{outorgadoAdvogado.toUpperCase()}</strong>, advogado(a) inscrito(a) na Ordem dos Advogados do Brasil sob o nº {outorgadoOab}, com escritório profissional de advocacia.
              </p>
              <p className="text-sm">
                <strong>PODERES:</strong> Pelo presente instrumento particular de procuração, o(a) OUTORGANTE nomeia e constitui o(a) OUTORGADO(A) como seu(sua) procurador(a), concedendo-lhe amplos poderes para o foro em geral, constantes da cláusula <em>"ad judicia et extra judicia"</em>, em qualquer Juízo, Tribunal ou Repartição Pública.
              </p>
              <p className="text-sm">
                <strong>PODERES ESPECIAIS:</strong> Incluindo poderes para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, assinar termo, firmar compromissos, receber e dar quitação, requerer execução e praticar todos os atos necessários ao bom e fiel cumprimento deste mandato.
              </p>
              <div className="pt-16 text-center text-sm space-y-12">
                <p>São Paulo/SP, {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.</p>
                <div className="inline-block border-t border-slate-900 px-12 pt-2">
                  <p className="font-bold">{outorganteNome.toUpperCase()}</p>
                  <p className="text-xs text-slate-500">Outorgante</p>
                </div>
              </div>
            </div>
          </div>
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
