"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Trash2, CheckCircle, Clock, Gavel, FileText, Mail, MessageSquare, BellOff, Loader2 } from "lucide-react";

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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Nunca disparado";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alertas")
      .then((res) => res.json())
      .then((data) => {
        setAlertas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar alertas:", err);
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
    } catch (err) {
      console.error("Erro ao salvar toggle de alerta:", err);
    }
  }

  const ativos = alertas.filter((a) => a.ativo).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Alertas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="font-semibold text-foreground">{ativos}</span> alertas ativos salvos no Supabase
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Ativos", value: ativos, color: "bg-green-500" },
          { label: "Pausados", value: alertas.length - ativos, color: "bg-gray-400" },
          { label: "Canal Principal", value: "Email", color: "bg-amber-500" },
          { label: "Frequência", value: "Tempo Real", color: "bg-blue-500" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card py-4"
          >
            <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
            <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alertas list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.length === 0 ? (
            <div className="card text-center py-16">
              <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">Nenhum alerta configurado</p>
              <p className="text-muted-foreground text-sm mt-1">Adicione processos para configurar alertas automáticos.</p>
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
                  className={`card transition-all duration-200 ${!alerta.ativo ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`badge ${alerta.ativo ? "badge-success" : "badge-primary"}`}>
                          {alerta.ativo ? <CheckCircle className="w-2.5 h-2.5" /> : <BellOff className="w-2.5 h-2.5" />}
                          {alerta.ativo ? "Ativo" : "Pausado"}
                        </span>
                        <span className="badge badge-primary">{processo?.tribunal || "TJSP"}</span>
                        <span className="badge badge-warning flex items-center gap-1">
                          <canal.icon className="w-2.5 h-2.5" />
                          {canal.label}
                        </span>
                      </div>

                      <code className="text-sm font-mono font-semibold text-foreground">{processo?.numeroCnj}</code>
                      <p className="text-sm text-muted-foreground mt-0.5">{processo?.classe}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <tipo.icon className="w-3 h-3" />
                          {tipo.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleAlerta(alerta.id, alerta.ativo)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${alerta.ativo ? "bg-success" : "bg-muted-foreground/30"}`}
                        title={alerta.ativo ? "Pausar alerta" : "Ativar alerta"}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${alerta.ativo ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Email config card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card bg-primary/3 border-primary/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Configurações de Email</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Alertas são enviados para <span className="font-medium text-foreground">teste@lexai.com.br</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
