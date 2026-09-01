"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Plus,
  CheckCircle,
  Clock,
  Gavel,
  FileText,
  Mail,
  MessageSquare,
  BellOff,
  Loader2,
  X,
} from "lucide-react";
import type { AlertaItem, ProcessoListItem } from "@/lib/types";

const tipoLabel: Record<string, { label: string; icon: React.ElementType }> = {
  QUALQUER_MOVIMENTACAO: { label: "Qualquer movimentação", icon: Bell },
  SENTENCA: { label: "Somente sentença", icon: Gavel },
  ACORDAO: { label: "Somente acórdão", icon: FileText },
  DESPACHO: { label: "Somente despacho", icon: FileText },
  AUDIENCIA: { label: "Audiências", icon: Clock },
};

const canalLabel: Record<string, { label: string; icon: React.ElementType }> = {
  EMAIL: { label: "Email", icon: Mail },
  WHATSAPP: { label: "WhatsApp", icon: MessageSquare },
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [processos, setProcessos] = useState<ProcessoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form novo alerta
  const [selectedProcesso, setSelectedProcesso] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("QUALQUER_MOVIMENTACAO");
  const [selectedCanal, setSelectedCanal] = useState("EMAIL");
  const [modalSaving, setModalSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/alertas").then((res) => res.json()),
      fetch("/api/processos").then((res) => res.json()),
    ])
      .then(([alertasData, processosData]) => {
        setAlertas(Array.isArray(alertasData) ? (alertasData as AlertaItem[]) : []);
        setProcessos(Array.isArray(processosData) ? (processosData as ProcessoListItem[]) : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar alertas:", error);
        setLoading(false);
      });
  }, []);

  async function toggleAlerta(id: string, estadoAtual: boolean) {
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ativo: !estadoAtual } : a))
    );
    try {
      await fetch("/api/alertas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ativo: !estadoAtual }),
      });
    } catch (error) {
      console.error("Erro ao salvar toggle de alerta:", error);
    }
  }

  async function handleCriarAlerta(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProcesso) return;
    setModalSaving(true);

    try {
      const res = await fetch("/api/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processoId: selectedProcesso,
          tipo: selectedTipo,
          canal: selectedCanal,
        }),
      });

      if (res.ok) {
        const novo = await res.json();
        setAlertas((prev) => [novo, ...prev]);
        setShowModal(false);
        setSelectedProcesso("");
      }
    } catch (error) {
      console.error("Erro ao criar alerta:", error);
    } finally {
      setModalSaving(false);
    }
  }

  const ativos = alertas.filter((a) => a.ativo).length;

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Alertas de Processos</h1>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-semibold text-slate-900">{ativos}</span> alertas ativos de monitoramento judicial
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Alerta
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Alertas Ativos", value: ativos, color: "bg-emerald-500" },
          { label: "Pausados", value: alertas.length - ativos, color: "bg-slate-400" },
          { label: "Canal Principal", value: "Email", color: "bg-amber-500" },
          { label: "Frequência", value: "Em Tempo Real", color: "bg-blue-500" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${s.color} mb-3`} />
            <div className="font-display text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alertas list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
              <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-900">Nenhum alerta configurado</p>
              <p className="text-slate-500 text-xs mt-1">Clique em &quot;Novo Alerta&quot; para ser notificado de alterações em seus processos.</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-4 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                + Criar Alerta
              </button>
            </div>
          ) : (
            alertas.map((alerta, i) => {
              const tipo = tipoLabel[alerta.tipo] || tipoLabel.QUALQUER_MOVIMENTACAO;
              const canal = canalLabel[alerta.canal] || canalLabel.EMAIL;
              const processo = alerta.processo;

              return (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all duration-200 ${!alerta.ativo ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${alerta.ativo ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"}`}>
                          {alerta.ativo ? <CheckCircle className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                          {alerta.ativo ? "Ativo" : "Pausado"}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {processo?.tribunal || "TJSP"}
                        </span>
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <canal.icon className="w-3 h-3" />
                          {canal.label}
                        </span>
                      </div>

                      <code className="text-sm font-mono font-bold text-slate-900">{processo?.numeroCnj}</code>
                      <p className="text-xs text-slate-500 mt-0.5">{processo?.classe}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <tipo.icon className="w-3.5 h-3.5 text-slate-400" />
                          {tipo.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleAlerta(alerta.id, alerta.ativo)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${alerta.ativo ? "bg-emerald-500" : "bg-slate-300"}`}
                        title={alerta.ativo ? "Pausar alerta" : "Ativar alerta"}
                        aria-label={alerta.ativo ? "Pausar alerta" : "Ativar alerta"}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${alerta.ativo ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Novo Alerta */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-alert-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 id="new-alert-title" className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Criar Novo Alerta
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                  aria-label="Fechar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCriarAlerta} className="space-y-4">
                <div>
                  <label htmlFor="alert-process" className="block text-xs font-semibold text-slate-700 mb-1">Selecione o Processo</label>
                  <select
                    id="alert-process"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    value={selectedProcesso}
                    onChange={(e) => setSelectedProcesso(e.target.value)}
                    required
                  >
                    <option value="">Escolha um processo...</option>
                    {processos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.numeroCnj} ({p.tribunal})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="alert-type" className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Evento</label>
                  <select
                    id="alert-type"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value)}
                  >
                    <option value="QUALQUER_MOVIMENTACAO">Qualquer movimentação</option>
                    <option value="SENTENCA">Somente Sentenças</option>
                    <option value="ACORDAO">Somente Acórdãos</option>
                    <option value="AUDIENCIA">Somente Audiências</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="alert-channel" className="block text-xs font-semibold text-slate-700 mb-1">Canal de Notificação</label>
                  <select
                    id="alert-channel"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    value={selectedCanal}
                    onChange={(e) => setSelectedCanal(e.target.value)}
                  >
                    <option value="EMAIL">Email</option>
                    <option value="WHATSAPP">WhatsApp (Em breve)</option>
                  </select>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving || !selectedProcesso}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {modalSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "+ Criar Alerta"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
