"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  FileCheck,
  DollarSign,
  Calendar,
  Sparkles,
  Printer,
  Download,
  CheckCircle,
  FileText,
  User,
  Building,
} from "lucide-react";

export default function FerramentasPage() {
  const [activeTab, setActiveTab] = useState<"calculadora" | "procuracao">("calculadora");

  // Calculadora State
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

  function imprimirProcuracao() {
    window.print();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Ferramentas Práticas</h1>
          <p className="text-muted-foreground text-sm mt-1">Cálculo trabalhista automatizado e gerador de procurações jurídicas.</p>
        </div>

        {/* Tabs switcher */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("calculadora")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "calculadora"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            Cálculo Trabalhista
          </button>
          <button
            onClick={() => setActiveTab("procuracao")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "procuracao"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck className="w-4 h-4 text-amber-400" />
            Gerador de Procuração
          </button>
        </div>
      </div>

      {/* ABA 1: CALCULADORA TRABALHISTA */}
      {activeTab === "calculadora" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Parâmetros */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">Parâmetros da Rescisão</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Último Salário Bruto (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                <input
                  type="number"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meses Trabalhados no Ano</label>
              <input
                type="number"
                min="1"
                max="12"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={mesesTrabalhados}
                onChange={(e) => setMesesTrabalhados(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tipo de Rescisão</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={tipoDemissao}
                onChange={(e) => setTipoDemissao(e.target.value)}
              >
                <option value="sem_justa_causa">Demissão Sem Justa Causa (Com Multa 40%)</option>
                <option value="com_justa_causa">Demissão Com Justa Causa</option>
                <option value="pedido_demissao">Pedido de Demissão pelo Empregado</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Aviso Prévio Indenizado</span>
              <input
                type="checkbox"
                checked={avisoPrevio}
                onChange={(e) => setAvisoPrevio(e.target.checked)}
                className="w-4 h-4 accent-slate-900 cursor-pointer"
              />
            </div>
          </div>

          {/* Resultado dos Cálculos */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Demonstrativo de Verbas Rescisórias
              </h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                Estimativa Automática
              </span>
            </div>

            {/* Total Highlight */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Rescisório Estimado</p>
                <p className="font-display text-4xl font-bold text-amber-400 mt-1">
                  R$ {totalEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* Discrimination Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                <span className="font-medium text-slate-700">13º Salário Proporcional ({mesesTrabalhados}/12)</span>
                <span className="font-bold text-slate-900">R$ {decimoTerceiro.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                <span className="font-medium text-slate-700">Férias Proporcionais ({mesesTrabalhados}/12)</span>
                <span className="font-bold text-slate-900">R$ {feriasProporcionais.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                <span className="font-medium text-slate-700">1/3 Constitucional sobre Férias</span>
                <span className="font-bold text-slate-900">R$ {tercoFerias.toFixed(2)}</span>
              </div>

              {avisoPrevio && (
                <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                  <span className="font-medium text-slate-700">Aviso Prévio Indenizado (1 mês)</span>
                  <span className="font-bold text-slate-900">R$ {avisoPrevioValor.toFixed(2)}</span>
                </div>
              )}

              {tipoDemissao === "sem_justa_causa" && (
                <div className="flex justify-between items-center p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 text-sm">
                  <span className="font-medium text-amber-900">Multa Rescisória de 40% sobre o FGTS</span>
                  <span className="font-bold text-amber-900">R$ {multaFgts.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed">
              * Cálculo baseado nas diretrizes gerais da CLT. Não substitui o cálculo oficial homologado nem considerações de convenções coletivas da categoria.
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GERADOR DE PROCURAÇÃO */}
      {activeTab === "procuracao" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Dados */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">Dados das Partes</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Cliente (Outorgante)</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={outorganteNome}
                onChange={(e) => setOutorganteNome(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CPF do Cliente</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={outorganteCpf}
                onChange={(e) => setOutorganteCpf(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">RG do Cliente</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={outorganteRg}
                onChange={(e) => setOutorganteRg(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Completo</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={outorganteEndereco}
                onChange={(e) => setOutorganteEndereco(e.target.value)}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Advogado (Outorgado)</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={outorgadoAdvogado}
                onChange={(e) => setOutorgadoAdvogado(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">OAB do Advogado</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={outorgadoOab}
                onChange={(e) => setOutorgadoOab(e.target.value)}
              />
            </div>
          </div>

          {/* Minuta Gerada */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="font-bold text-slate-900 text-sm">Visualização do Documento</span>
              <button
                onClick={imprimirProcuracao}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Imprimir / Salvar PDF
              </button>
            </div>

            {/* Folha de Documento Oficial */}
            <div className="bg-white rounded-2xl p-10 border border-slate-300 shadow-xl space-y-6 text-slate-900 font-serif leading-relaxed text-justify">
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
