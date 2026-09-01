"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  Archive,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { ProcessoListItem } from "@/lib/types";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  ATIVO: { label: "Ativo", className: "badge-success", icon: CheckCircle },
  SUSPENSO: { label: "Suspenso", className: "badge-warning", icon: Clock },
  BAIXADO: { label: "Baixado", className: "badge-primary", icon: Archive },
  ARQUIVADO: { label: "Arquivado", className: "badge-primary", icon: Archive },
};

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<ProcessoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  async function buscarProcessos() {
    try {
      const response = await fetch("/api/processos");
      const data = (await response.json()) as unknown;
      setProcessos(Array.isArray(data) ? (data as ProcessoListItem[]) : []);
    } catch (error) {
      console.error("Erro ao carregar processos:", error);
    } finally {
      setLoading(false);
    }
  }

  function carregarProcessos() {
    setLoading(true);
    void buscarProcessos();
  }

  useEffect(() => {
    const controller = new AbortController();

    async function carregarProcessosInicialmente() {
      try {
        const response = await fetch("/api/processos", { signal: controller.signal });
        const data = (await response.json()) as unknown;
        if (!controller.signal.aborted) {
          setProcessos(Array.isArray(data) ? (data as ProcessoListItem[]) : []);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Erro ao carregar processos:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void carregarProcessosInicialmente();
    return () => controller.abort();
  }, []);

  const filtered = processos.filter((p) => {
    const matchSearch =
      p.numeroCnj.includes(search) ||
      (p.classe && p.classe.toLowerCase().includes(search.toLowerCase())) ||
      (p.tribunal && p.tribunal.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "TODOS" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Meus Processos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {processos.length} processos monitorados no Supabase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={carregarProcessos}
            className="btn-outline text-sm py-2 px-3"
            aria-label="Atualizar processos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <Link href="/dashboard/processos/novo" className="btn-accent text-sm">
            <Plus className="w-4 h-4" />
            Adicionar
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Buscar por número CNJ, classe ou tribunal..."
            aria-label="Buscar processos por número CNJ, classe ou tribunal"
            className="input text-sm"
            style={{ paddingLeft: "2.75rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {["TODOS", "ATIVO", "SUSPENSO", "BAIXADO"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "TODOS" ? "Todos" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Process List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">Nenhum processo encontrado</p>
              <p className="text-muted-foreground text-sm mt-1">
                Tente ajustar a busca ou adicione um novo processo.
              </p>
              <Link href="/dashboard/processos/novo" className="btn-accent mt-4 inline-flex">
                <Plus className="w-4 h-4" /> Adicionar processo
              </Link>
            </div>
          ) : (
            filtered.map((processo, i) => {
              const st = statusConfig[processo.status] || statusConfig.ATIVO;
              const ultimaMov = processo.movimentacoes?.[0];

              return (
                <motion.div
                  key={processo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <Link
                    href={`/dashboard/processos/${processo.id}`}
                    className="block card hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`badge ${st.className}`}>
                            <st.icon className="w-2.5 h-2.5" />
                            {st.label}
                          </span>
                          <span className="badge badge-primary">{processo.tribunal}</span>
                        </div>

                        {/* CNJ number */}
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono text-foreground font-semibold">
                            {processo.numeroCnj}
                          </code>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </div>

                        {/* Class and subject */}
                        <p className="text-sm text-foreground font-medium">{processo.classe}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{processo.assunto}</p>

                        {/* Footer info */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {ultimaMov && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Última movimentação: {ultimaMov.tipo} ({new Date(ultimaMov.data).toLocaleDateString("pt-BR")})
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
