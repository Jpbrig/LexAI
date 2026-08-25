"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Clock,
  Gavel,
  Bell,
  ExternalLink,
  CheckCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const tipoColors: Record<string, string> = {
  Sentença: "bg-red-500",
  Acórdão: "bg-blue-600",
  Despacho: "bg-amber-500",
  Audiência: "bg-green-500",
  Distribuição: "bg-purple-500",
};

export default function ProcessoDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [processo, setProcesso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMov, setExpandedMov] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [aiResumos, setAiResumos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    fetch(`/api/processos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProcesso(data);
        if (data?.movimentacoes?.length > 0) {
          setExpandedMov(data.movimentacoes[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes do processo:", err);
        setLoading(false);
      });
  }, [id]);

  async function gerarResumoIa(movId: string, tipo: string, descricao: string) {
    setLoadingAi(movId);
    try {
      const res = await fetch("/api/ai/resumo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: descricao, tipo }),
      });
      const data = await res.json();

      if (data.resumo) {
        setAiResumos((prev) => ({
          ...prev,
          [movId]: data.resumo,
        }));
      }
    } catch (err) {
      console.error("Erro ao gerar resumo de IA:", err);
    } finally {
      setLoadingAi(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="card text-center py-16">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground">Processo não encontrado</p>
        <Link href="/dashboard/processos" className="btn-outline mt-4 inline-flex">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Breadcrumb */}
      <Link href="/dashboard/processos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Voltar para processos
      </Link>

      {/* Process Header Card */}
      <div className="card-premium border border-border">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge badge-success">
                <CheckCircle className="w-2.5 h-2.5" />
                {processo.status || "ATIVO"}
              </span>
              <span className="badge badge-primary">{processo.tribunal}</span>
            </div>
            <code className="text-base font-mono font-bold text-foreground">{processo.numeroCnj}</code>
            <h1 className="font-display text-2xl font-bold text-primary mt-1">{processo.classe}</h1>
            <p className="text-muted-foreground text-sm mt-1">{processo.assunto}</p>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Órgão Julgador</p>
                <p className="text-sm font-medium text-foreground">{processo.orgaoJulgador || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Data de Distribuição</p>
                <p className="text-sm font-medium text-foreground">
                  {processo.dataDistribuicao ? new Date(processo.dataDistribuicao).toLocaleDateString("pt-BR") : "Recente"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-shrink-0">
            <a
              href={`https://api-publica.datajud.cnj.jus.br`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm py-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ver no DataJud
            </a>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-foreground text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Histórico de Movimentações
            <span className="badge badge-primary ml-1">{processo.movimentacoes?.length || 0}</span>
          </h2>
        </div>

        <div className="relative pl-8">
          <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-0">
            {(!processo.movimentacoes || processo.movimentacoes.length === 0) ? (
              <p className="text-sm text-muted-foreground py-4">Nenhuma movimentação registrada para este processo.</p>
            ) : (
              processo.movimentacoes.map((mov: any, i: number) => {
                const isExpanded = expandedMov === mov.id;
                const dotColor = tipoColors[mov.tipo] || "bg-primary";
                const resumo = aiResumos[mov.id] || mov.resumoIa;
                const urgente = mov.tipo === "Sentença" || mov.tipo === "Acórdão";

                return (
                  <motion.div
                    key={mov.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="relative pb-6"
                  >
                    <div className={`absolute -left-5 w-3.5 h-3.5 rounded-full ${dotColor} border-2 border-white shadow-sm top-1.5`} />

                    <div
                      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                        urgente ? "border-red-200 bg-red-50/30" : "border-border bg-white"
                      } ${isExpanded ? "shadow-card" : "hover:border-primary/20 hover:bg-primary/1"}`}
                    >
                      <button
                        className="w-full text-left p-4 flex items-start justify-between gap-3"
                        onClick={() => setExpandedMov(isExpanded ? null : mov.id)}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="badge text-white text-xs" style={{ background: tipoColors[mov.tipo] || "#0F1B35" }}>
                              <Gavel className="w-2.5 h-2.5" />
                              {mov.tipo}
                            </span>
                            {urgente && (
                              <span className="badge badge-destructive">
                                <AlertCircle className="w-2.5 h-2.5" />
                                Decisão
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(mov.data)}
                          </p>
                          {!isExpanded && (
                            <p className="text-sm text-foreground mt-1.5 line-clamp-1">{mov.descricao}</p>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  Texto da Movimentação
                                </p>
                                <p className="text-sm text-foreground leading-relaxed bg-muted/50 rounded-lg p-4">
                                  {mov.descricao}
                                </p>
                              </div>

                              {resumo ? (
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                                      <Brain className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                                      Resumo com IA
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground leading-relaxed">{resumo}</p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => gerarResumoIa(mov.id, mov.tipo, mov.descricao)}
                                  disabled={loadingAi === mov.id}
                                  className="btn-primary text-sm py-2 w-full justify-center"
                                >
                                  {loadingAi === mov.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Analisando com IA...
                                    </>
                                  ) : (
                                    <>
                                      <Brain className="w-4 h-4" />
                                      Explicar esta decisão com IA
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
