"use client";

import { useState } from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle2, Plus, Calculator, ChevronLeft, ChevronRight, Bell } from "lucide-react";

type EventoAgenda = {
  id: string;
  titulo: string;
  tipo: "Prazo Processual" | "Audiência" | "Reunião" | "Perícia";
  data: string;
  hora: string;
  processo: string;
  cliente: string;
  status: "Pendente" | "Concluído";
  prioridade: "Alta" | "Média" | "Baixa";
};

export default function AgendaPage() {
  const [eventos, setEventos] = useState<EventoAgenda[]>([
    {
      id: "ev_1",
      titulo: "Contestação — Ação Trabalhista",
      tipo: "Prazo Processual",
      data: "2026-08-28",
      hora: "23:59",
      processo: "0012345-67.2023.8.26.0100",
      cliente: "Carlos Eduardo Silva",
      status: "Pendente",
      prioridade: "Alta"
    },
    {
      id: "ev_2",
      titulo: "Audiência de Conciliação Virtual",
      tipo: "Audiência",
      data: "2026-08-30",
      hora: "14:30",
      processo: "0098765-43.2022.4.03.6100",
      cliente: "Empresa XYZ S/A",
      status: "Pendente",
      prioridade: "Alta"
    },
    {
      id: "ev_3",
      titulo: "Reunião de Alinhamento de Contrato",
      tipo: "Reunião",
      data: "2026-09-01",
      hora: "10:00",
      processo: "N/A",
      cliente: "Mariana Souza Santos",
      status: "Pendente",
      prioridade: "Média"
    }
  ]);

  const [showModalNovo, setShowModalNovo] = useState(false);
  const [showCalcDiasUteis, setShowCalcDiasUteis] = useState(false);

  // Form de Novo Prazo/Evento
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<EventoAgenda["tipo"]>("Prazo Processual");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("17:00");
  const [processo, setProcesso] = useState("");
  const [cliente, setCliente] = useState("");
  const [prioridade, setPrioridade] = useState<EventoAgenda["prioridade"]>("Alta");

  // Calculadora de Dias Úteis
  const [calcDataInicio, setCalcDataInicio] = useState("");
  const [calcDias, setCalcDias] = useState("15");
  const [calcRegra, setCalcRegra] = useState<"cpc" | "clt">("cpc");
  const [calcResultado, setCalcResultado] = useState<string | null>(null);

  function calcularPrazoDiasUteis() {
    if (!calcDataInicio || !calcDias) return;
    const inicio = new Date(calcDataInicio);
    let diasFaltantes = parseInt(calcDias, 10);
    const atual = new Date(inicio);

    // Soma dias úteis (pula sábado e domingo)
    while (diasFaltantes > 0) {
      atual.setDate(atual.getDate() + 1);
      const dayOfWeek = atual.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        diasFaltantes--;
      }
    }

    setCalcResultado(atual.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  }

  function handleSalvarEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !data) return;

    const novo: EventoAgenda = {
      id: `ev_${Date.now()}`,
      titulo,
      tipo,
      data,
      hora,
      processo: processo || "N/A",
      cliente: cliente || "Geral",
      status: "Pendente",
      prioridade
    };

    setEventos([novo, ...eventos]);
    setShowModalNovo(false);
    setTitulo("");
    setData("");
    setProcesso("");
    setCliente("");
  }

  function toggleStatus(id: string) {
    setEventos(eventos.map(e => e.id === id ? { ...e, status: e.status === "Pendente" ? "Concluído" : "Pendente" } : e));
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-500" />
            Agenda &amp; Prazos Processuais
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Controle de compromissos, audiências e calculadora automática de prazos em dias úteis (CPC/CLT).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCalcDiasUteis(true)} className="btn-outline text-sm px-4 py-2.5 bg-white">
            <Calculator className="w-4 h-4 text-amber-600" />
            Calculadora de Prazos
          </button>
          <button onClick={() => setShowModalNovo(true)} className="btn-primary text-sm px-4 py-2.5 shadow-md">
            <Plus className="w-4 h-4 text-amber-400" />
            + Novo Prazo / Compromisso
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-red-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prazos Críticos</span>
          <p className="text-2xl font-black text-red-600 mt-1">
            {eventos.filter(e => e.prioridade === "Alta" && e.status === "Pendente").length} Pendentes
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Vencimentos nos próximos dias</p>
        </div>

        <div className="card p-5 border-l-4 border-l-amber-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audiências &amp; Reuniões</span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {eventos.filter(e => e.tipo === "Audiência" || e.tipo === "Reunião").length} Marcadas
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Compromissos presenciais e virtuais</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prazos Cumpridos</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {eventos.filter(e => e.status === "Concluído").length} Concluídos
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Prazos baixados este mês</p>
        </div>
      </div>

      {/* Lista de Prazos e Compromissos */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-base">Próximos Vencimentos &amp; Prazos</h2>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
            {eventos.length} Cadastrados
          </span>
        </div>

        <div className="space-y-3">
          {eventos.map((ev) => (
            <div
              key={ev.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                ev.status === "Concluído"
                  ? "bg-slate-50 border-slate-200 opacity-60"
                  : ev.prioridade === "Alta"
                  ? "bg-red-50/40 border-red-200"
                  : "bg-white border-slate-200 hover:border-amber-300"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    ev.tipo === "Prazo Processual" ? "bg-red-100 text-red-800" :
                    ev.tipo === "Audiência" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {ev.tipo.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    📅 {new Date(ev.data + "T00:00:00").toLocaleDateString("pt-BR")} às {ev.hora}
                  </span>
                </div>
                <h3 className={`font-bold text-base text-slate-900 ${ev.status === "Concluído" ? "line-through" : ""}`}>
                  {ev.titulo}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Processo: <strong>{ev.processo}</strong></span>
                  <span>• Cliente: <strong>{ev.cliente}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(ev.id)}
                  className={`btn-outline text-xs px-3 py-1.5 ${
                    ev.status === "Concluído"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white text-slate-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {ev.status === "Concluído" ? "Cumprido" : "Marcar Cumprido"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Calculadora de Prazos em Dias Úteis */}
      {showCalcDiasUteis && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                Calculadora de Prazos em Dias Úteis
              </h2>
              <button onClick={() => setShowCalcDiasUteis(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Legislação / Regra</label>
                <select className="input" value={calcRegra} onChange={(e) => setCalcRegra(e.target.value as "cpc" | "clt")}>
                  <option value="cpc">CPC (Art. 219 — Dias Úteis)</option>
                  <option value="clt">CLT (Art. 775 — Dias Úteis Trabalhistas)</option>
                </select>
              </div>

              <div>
                <label className="label">Data de Publicação / Intimação</label>
                <input type="date" className="input" value={calcDataInicio} onChange={(e) => setCalcDataInicio(e.target.value)} />
              </div>

              <div>
                <label className="label">Quantidade de Dias de Prazo</label>
                <input type="number" className="input" placeholder="Ex: 15" value={calcDias} onChange={(e) => setCalcDias(e.target.value)} />
              </div>

              <button onClick={calcularPrazoDiasUteis} className="btn-primary w-full justify-center py-2.5 text-xs">
                Calcular Data Final de Vencimento
              </button>

              {calcResultado && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1 text-amber-950">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Vencimento Estimado (Dias Úteis)</span>
                  <p className="font-black text-sm capitalize">{calcResultado}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowCalcDiasUteis(false)} className="btn-outline text-xs px-4 py-2">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Prazo */}
      {showModalNovo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSalvarEvento} className="card max-w-lg w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Cadastrar Prazo / Compromisso
              </h2>
              <button type="button" onClick={() => setShowModalNovo(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Título do Compromisso / Prazo</label>
                <input type="text" className="input" placeholder="Ex: Contestação, Audiência de Conciliação..." value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as EventoAgenda["tipo"])}>
                  <option value="Prazo Processual">Prazo Processual</option>
                  <option value="Audiência">Audiência</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Perícia">Perícia</option>
                </select>
              </div>
              <div>
                <label className="label">Prioridade</label>
                <select className="input" value={prioridade} onChange={(e) => setPrioridade(e.target.value as EventoAgenda["prioridade"])}>
                  <option value="Alta">🔴 Alta (Crítico)</option>
                  <option value="Média">🟡 Média</option>
                  <option value="Baixa">🟢 Baixa</option>
                </select>
              </div>
              <div>
                <label className="label">Data de Vencimento</label>
                <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} required />
              </div>
              <div>
                <label className="label">Horário Limite</label>
                <input type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
              <div>
                <label className="label">Número do Processo (opcional)</label>
                <input type="text" className="input" placeholder="Ex: 0012345-67..." value={processo} onChange={(e) => setProcesso(e.target.value)} />
              </div>
              <div>
                <label className="label">Nome do Cliente</label>
                <input type="text" className="input" placeholder="Ex: Carlos Silva..." value={cliente} onChange={(e) => setCliente(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowModalNovo(false)} className="btn-outline text-xs px-4 py-2">Cancelar</button>
              <button type="submit" className="btn-primary text-xs px-5 py-2">Salvar na Agenda</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
