"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

const processos = [
  {
    id: "1",
    numeroCnj: "0012345-67.2023.8.26.0100",
    tribunal: "TJSP",
    classe: "Ação de Indenização por Danos Morais",
    assunto: "Responsabilidade Civil",
    status: "ATIVO",
    ultimaMovimentacao: "Sentença — 25/08/2026",
    dataDistribuicao: "12/03/2023",
    urgente: true,
  },
  {
    id: "2",
    numeroCnj: "0098765-43.2022.4.03.6100",
    tribunal: "TRF3",
    classe: "Mandado de Segurança",
    assunto: "Direito Tributário",
    status: "ATIVO",
    ultimaMovimentacao: "Despacho — 25/08/2026",
    dataDistribuicao: "05/07/2022",
    urgente: false,
  },
  {
    id: "3",
    numeroCnj: "0001122-33.2024.5.15.0001",
    tribunal: "TRT15",
    classe: "Reclamação Trabalhista",
    assunto: "Horas Extras",
    status: "ATIVO",
    ultimaMovimentacao: "Acórdão — 24/08/2026",
    dataDistribuicao: "19/01/2024",
    urgente: true,
  },
  {
    id: "4",
    numeroCnj: "0055678-90.2021.8.19.0001",
    tribunal: "TJRJ",
    classe: "Execução de Título Extrajudicial",
    assunto: "Cheque",
    status: "SUSPENSO",
    ultimaMovimentacao: "Audiência designada — 24/08/2026",
    dataDistribuicao: "30/06/2021",
    urgente: false,
  },
  {
    id: "5",
    numeroCnj: "0034567-89.2020.8.26.0050",
    tribunal: "TJSP",
    classe: "Divórcio Consensual",
    assunto: "Dissolução da Sociedade Conjugal",
    status: "BAIXADO",
    ultimaMovimentacao: "Arquivamento — 10/01/2025",
    dataDistribuicao: "15/04/2020",
    urgente: false,
  },
];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  ATIVO: { label: "Ativo", className: "badge-success", icon: CheckCircle },
  SUSPENSO: { label: "Suspenso", className: "badge-warning", icon: Clock },
  BAIXADO: { label: "Baixado", className: "badge-primary", icon: Archive },
  ARQUIVADO: { label: "Arquivado", className: "badge-primary", icon: Archive },
};

export default function ProcessosPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  const filtered = processos.filter((p) => {
    const matchSearch =
      p.numeroCnj.includes(search) ||
      p.classe.toLowerCase().includes(search.toLowerCase()) ||
      p.tribunal.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "TODOS" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Meus Processos</h1>
          <p className="text-muted-foreground text-sm mt-1">{processos.length} processos monitorados</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline text-sm py-2 px-3">
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </button>
          <Link href="/dashboard/processos/novo" className="btn-accent text-sm">
            <Plus className="w-4 h-4" />
            Adicionar
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por número CNJ, classe ou tribunal..."
            className="input pl-9"
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
              {s === "TODOS" ? "Todos" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Process List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Nenhum processo encontrado</p>
            <p className="text-muted-foreground text-sm mt-1">Tente ajustar a busca ou adicione um novo processo.</p>
            <Link href="/dashboard/processos/novo" className="btn-accent mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Adicionar processo
            </Link>
          </div>
        ) : (
          filtered.map((processo, i) => {
            const st = statusConfig[processo.status];
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
                        {processo.urgente && (
                          <span className="badge badge-destructive">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Nova movimentação
                          </span>
                        )}
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
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {processo.ultimaMovimentacao}
                        </span>
                        <span>Distribuído em {processo.dataDistribuicao}</span>
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
    </div>
  );
}
