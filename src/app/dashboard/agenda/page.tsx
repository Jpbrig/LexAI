"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Plus,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { EventoAgenda } from "@/lib/types";

export default function AgendaPage() {
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [loading, setLoading] = useState(true);

  async function buscarEventos() {
    try {
      const response = await fetch("/api/agenda");
      const data = (await response.json()) as unknown;
      setEventos(Array.isArray(data) ? (data as EventoAgenda[]) : []);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
    } finally {
      setLoading(false);
    }
  }

  function carregarEventos() {
    setLoading(true);
    void buscarEventos();
  }

  useEffect(() => {
    const controller = new AbortController();

    async function carregarEventosInicialmente() {
      try {
        const response = await fetch("/api/agenda", { signal: controller.signal });
        const data = (await response.json()) as unknown;
        if (Array.isArray(data)) setEventos(data as EventoAgenda[]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Erro ao carregar agenda:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void carregarEventosInicialmente();
    return () => controller.abort();
  }, []);

  // Modo de visualização principal: "lista" | "dia" | "mes" | "ano"
  const [modoView, setModoView] = useState<"lista" | "dia" | "mes" | "ano">("mes");
  const [dataAtual, setDataAtual] = useState(new Date(2026, 7, 26)); // Agosto 2026

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
    const inicio = new Date(calcDataInicio + "T00:00:00");
    let diasFaltantes = parseInt(calcDias, 10);
    const atual = new Date(inicio);

    while (diasFaltantes > 0) {
      atual.setDate(atual.getDate() + 1);
      const dayOfWeek = atual.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        diasFaltantes--;
      }
    }

    setCalcResultado(
      atual.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }

  async function handleSalvarEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !data) return;

    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, tipo, data, hora, processo, cliente, prioridade }),
      });

      if (res.ok) {
        carregarEventos();
        setShowModalNovo(false);
        setTitulo("");
        setData("");
        setProcesso("");
        setCliente("");
      }
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
    }
  }

  async function toggleStatus(id: string) {
    const ev = eventos.find((e) => e.id === id);
    if (!ev) return;
    const novoStatus = ev.status === "Pendente" ? "Concluído" : "Pendente";

    try {
      await fetch("/api/agenda", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: novoStatus }),
      });

      setEventos(
        eventos.map((e) => (e.id === id ? { ...e, status: novoStatus } : e))
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  }

  // Navegação de datas
  function navegar(direcao: number) {
    const nova = new Date(dataAtual);
    if (modoView === "dia") {
      nova.setDate(nova.getDate() + direcao);
    } else if (modoView === "mes") {
      nova.setMonth(nova.getMonth() + direcao);
    } else if (modoView === "ano") {
      nova.setFullYear(nova.getFullYear() + direcao);
    }
    setDataAtual(nova);
  }

  // Auxiliares de cálculo do Calendário Mensal
  const anoAtual = dataAtual.getFullYear();
  const mesAtual = dataAtual.getMonth();

  const primeiroDiaDoMes = new Date(anoAtual, mesAtual, 1).getDay();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dataIsoDia = dataAtual.toISOString().split("T")[0];

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-amber-500" />
            Agenda &amp; Prazos Processuais
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Controle de compromissos, audiências e calculadora de prazos em dias úteis (CPC/CLT).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowCalcDiasUteis(true)} className="btn-outline text-xs px-3.5 py-2.5 bg-white">
            <Calculator className="w-4 h-4 text-amber-600" />
            Calculadora de Prazos
          </button>
          <button onClick={() => setShowModalNovo(true)} className="btn-primary text-xs px-4 py-2.5 shadow-md">
            <Plus className="w-4 h-4 text-amber-400" />
            + Novo Prazo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-red-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prazos Críticos</span>
          <p className="text-2xl font-black text-red-600 mt-1">
            {eventos.filter((e) => e.prioridade === "Alta" && e.status === "Pendente").length} Pendentes
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Vencimentos nos próximos dias</p>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audiências &amp; Reuniões</span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {eventos.filter((e) => e.tipo === "Audiência" || e.tipo === "Reunião").length} Marcadas
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Compromissos presenciais e virtuais</p>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prazos Cumpridos</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {eventos.filter((e) => e.status === "Concluído").length} Concluídos
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Prazos baixados este mês</p>
        </div>
      </div>

      {/* Seletor de Modo de Visualização (Dia, Mês, Ano, Lista) */}
      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" aria-label="Carregando agenda" />
          Carregando agenda...
        </div>
      ) : (
      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navegar(-1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50" aria-label="Período anterior">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <h2 className="font-bold text-slate-900 text-lg min-w-[180px] text-center">
              {modoView === "dia" && dataAtual.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              {modoView === "mes" && `${nomesMeses[mesAtual]} de ${anoAtual}`}
              {modoView === "ano" && `Ano de ${anoAtual}`}
              {modoView === "lista" && "Todos os Prazos"}
            </h2>
            <button type="button" onClick={() => navegar(1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50" aria-label="Próximo período">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Botões de Alternância de Visão */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setModoView("dia")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoView === "dia" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              📅 Dia
            </button>
            <button
              onClick={() => setModoView("mes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoView === "mes" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              📆 Mês
            </button>
            <button
              onClick={() => setModoView("ano")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoView === "ano" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🗓️ Ano
            </button>
            <button
              onClick={() => setModoView("lista")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                modoView === "lista" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              📋 Lista
            </button>
          </div>
        </div>

        {/* --- VISÃO DIA --- */}
        {modoView === "dia" && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Compromissos para {dataAtual.toLocaleDateString("pt-BR")}
            </p>
            {eventos.filter((e) => e.data === dataIsoDia).length > 0 ? (
              eventos
                .filter((e) => e.data === dataIsoDia)
                .map((ev) => (
                  <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {ev.hora} — {ev.tipo}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{ev.titulo}</h4>
                      <p className="text-xs text-slate-500">Processo: {ev.processo} • Cliente: {ev.cliente}</p>
                    </div>
                    <button onClick={() => toggleStatus(ev.id)} className="btn-outline text-xs py-1.5 px-3">
                      {ev.status === "Concluído" ? "Cumprido" : "Baixar Prazo"}
                    </button>
                  </div>
                ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Nenhum compromisso marcado para este dia.
              </div>
            )}
          </div>
        )}

        {/* --- VISÃO MÊS (GRID DE CALENDÁRIO) --- */}
        {modoView === "mes" && (
          <div className="animate-fade-in space-y-2">
            {/* Dias da Semana Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 pb-1">
              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>

            {/* Células do Calendário */}
            <div className="grid grid-cols-7 gap-1">
              {/* Células vazias do mês anterior */}
              {Array.from({ length: primeiroDiaDoMes }).map((_, i) => (
                <div key={`vazio_${i}`} className="h-24 bg-slate-50/50 rounded-lg border border-slate-100" />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: diasNoMes }).map((_, idx) => {
                const dia = idx + 1;
                const diaStr = dia < 10 ? `0${dia}` : `${dia}`;
                const mesStr = mesAtual + 1 < 10 ? `0${mesAtual + 1}` : `${mesAtual + 1}`;
                const dataFormatada = `${anoAtual}-${mesStr}-${diaStr}`;

                const eventosDoDia = eventos.filter((e) => e.data === dataFormatada);

                return (
                  <button
                    type="button"
                    key={dia}
                    onClick={() => {
                      setDataAtual(new Date(anoAtual, mesAtual, dia));
                      setModoView("dia");
                    }}
                    aria-label={`Abrir compromissos do dia ${dia}`}
                    className="h-24 p-1.5 bg-white rounded-lg border border-slate-200 hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between text-left"
                  >
                    <span className="font-bold text-xs text-slate-700">{dia}</span>
                    <div className="space-y-1 overflow-y-auto">
                      {eventosDoDia.map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] font-bold p-1 rounded truncate ${
                            ev.prioridade === "Alta"
                              ? "bg-red-100 text-red-900"
                              : ev.tipo === "Audiência"
                              ? "bg-purple-100 text-purple-900"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {ev.hora} {ev.titulo}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VISÃO ANO --- */}
        {modoView === "ano" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in">
            {nomesMeses.map((m, idxMes) => {
              const countEventosMes = eventos.filter((e) => {
                const parts = e.data.split("-");
                return parseInt(parts[0], 10) === anoAtual && parseInt(parts[1], 10) === idxMes + 1;
              }).length;

              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setDataAtual(new Date(anoAtual, idxMes, 1));
                    setModoView("mes");
                  }}
                  aria-label={`Abrir calendário de ${m} de ${anoAtual}`}
                  className="card w-full p-4 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all space-y-2 bg-white text-left"
                >
                  <h3 className="font-bold text-sm text-slate-900">{m}</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Compromissos:</span>
                    <span className={`font-extrabold px-2 py-0.5 rounded-full text-[10px] ${
                      countEventosMes > 0 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500"
                    }`}>
                      {countEventosMes} Prazos
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* --- VISÃO LISTA --- */}
        {modoView === "lista" && (
          <div className="space-y-3 animate-fade-in">
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
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        ev.tipo === "Prazo Processual"
                          ? "bg-red-100 text-red-800"
                          : ev.tipo === "Audiência"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
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
        )}
      </div>
      )}

      {/* Modal Calculadora de Prazos em Dias Úteis */}
      {showCalcDiasUteis && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                Calculadora de Prazos em Dias Úteis
              </h2>
              <button type="button" onClick={() => setShowCalcDiasUteis(false)} className="text-slate-400 hover:text-slate-600" aria-label="Fechar calculadora de prazos">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="calc-regra" className="label">Legislação / Regra</label>
                <select id="calc-regra" className="input" value={calcRegra} onChange={(e) => setCalcRegra(e.target.value as "cpc" | "clt")}>
                  <option value="cpc">CPC (Art. 219 — Dias Úteis)</option>
                  <option value="clt">CLT (Art. 775 — Dias Úteis Trabalhistas)</option>
                </select>
              </div>

              <div>
                <label htmlFor="calc-data-inicio" className="label">Data de Publicação / Intimação</label>
                <input id="calc-data-inicio" type="date" className="input" value={calcDataInicio} onChange={(e) => setCalcDataInicio(e.target.value)} />
              </div>

              <div>
                <label htmlFor="calc-dias" className="label">Quantidade de Dias de Prazo</label>
                <input id="calc-dias" type="number" className="input" placeholder="Ex: 15" value={calcDias} onChange={(e) => setCalcDias(e.target.value)} />
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
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                Cadastrar Prazo / Compromisso
              </h2>
              <button type="button" onClick={() => setShowModalNovo(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="agenda-titulo" className="label">Título do Compromisso / Prazo</label>
                <input id="agenda-titulo" type="text" className="input" placeholder="Ex: Contestação, Audiência de Conciliação..." value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="agenda-tipo" className="label">Tipo</label>
                <select id="agenda-tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value as EventoAgenda["tipo"])}>
                  <option value="Prazo Processual">Prazo Processual</option>
                  <option value="Audiência">Audiência</option>
                  <option value="Reunião">Reunião</option>
                  <option value="Perícia">Perícia</option>
                </select>
              </div>
              <div>
                <label htmlFor="agenda-prioridade" className="label">Prioridade</label>
                <select id="agenda-prioridade" className="input" value={prioridade} onChange={(e) => setPrioridade(e.target.value as EventoAgenda["prioridade"])}>
                  <option value="Alta">🔴 Alta (Crítico)</option>
                  <option value="Média">🟡 Média</option>
                  <option value="Baixa">🟢 Baixa</option>
                </select>
              </div>
              <div>
                <label htmlFor="agenda-data" className="label">Data de Vencimento</label>
                <input id="agenda-data" type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="agenda-hora" className="label">Horário Limite</label>
                <input id="agenda-hora" type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
              <div>
                <label htmlFor="agenda-processo" className="label">Número do Processo (opcional)</label>
                <input id="agenda-processo" type="text" className="input" placeholder="Ex: 0012345-67..." value={processo} onChange={(e) => setProcesso(e.target.value)} />
              </div>
              <div>
                <label htmlFor="agenda-cliente" className="label">Nome do Cliente</label>
                <input id="agenda-cliente" type="text" className="input" placeholder="Ex: Carlos Silva..." value={cliente} onChange={(e) => setCliente(e.target.value)} />
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
