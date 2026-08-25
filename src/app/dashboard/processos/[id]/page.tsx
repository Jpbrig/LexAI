"use client";

import { useState } from "react";
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
  Scale,
  AlertCircle,
} from "lucide-react";

// Mock data — será substituído por dados reais do DataJud
const processoMock = {
  id: "1",
  numeroCnj: "0012345-67.2023.8.26.0100",
  tribunal: "TJSP",
  classe: "Ação de Indenização por Danos Morais",
  assunto: "Responsabilidade Civil / Dano Moral",
  orgaoJulgador: "14ª Vara Cível — Foro Central",
  dataDistribuicao: "12/03/2023",
  status: "ATIVO",
  partes: [
    { tipo: "Autor", nome: "João da Silva" },
    { tipo: "Réu", nome: "Empresa XYZ Ltda." },
  ],
};

const movimentacoesMock = [
  {
    id: "m1",
    data: "2026-08-25T10:30:00",
    tipo: "Sentença",
    descricao:
      "Vistos. Trata-se de ação de reparação de danos morais proposta por João da Silva em face de Empresa XYZ Ltda. Após instrução do feito com prova documental e oitiva de testemunhas, julgo PROCEDENTE o pedido inicial para condenar o réu ao pagamento de R$ 15.000,00 (quinze mil reais) a título de danos morais. Custas processuais e honorários advocatícios de 15% sobre o valor da condenação a cargo do réu. Prazo para recurso: 15 dias. Cumpra-se.",
    resumoIa:
      "✅ DECISÃO FAVORÁVEL: O juiz deu ganho de causa ao seu cliente (João da Silva). O réu foi condenado a pagar R$ 15.000,00 de danos morais. O réu ainda paga as custas do processo e 15% de honorários sobre o valor da condenação. Prazo para o réu recorrer: 15 dias a partir da intimação.",
    urgente: true,
  },
  {
    id: "m2",
    data: "2026-07-10T14:00:00",
    tipo: "Audiência",
    descricao:
      "Aos dez dias do mês de julho de 2026, às 14:00 horas, na sala de audiências do juízo, foram ouvidas as testemunhas arroladas pelo autor. A testemunha João Pereira confirmou os fatos narrados na inicial. Encerrada a instrução, as partes apresentaram alegações finais oralmente. O feito foi concluso para sentença.",
    resumoIa:
      "📋 AUDIÊNCIA REALIZADA: As testemunhas foram ouvidas e confirmaram os fatos do seu cliente. Após a audiência, o processo foi encaminhado para o juiz proferir a sentença. Aguardar decisão.",
    urgente: false,
  },
  {
    id: "m3",
    data: "2026-05-20T09:00:00",
    tipo: "Despacho",
    descricao:
      "Designo audiência de instrução e julgamento para o dia 10/07/2026 às 14:00 horas. Intimem-se as partes e suas testemunhas. Cumpra-se.",
    resumoIa:
      "📅 AUDIÊNCIA MARCADA: O juiz agendou audiência para 10/07/2026 às 14h. Seu cliente e as testemunhas precisam ser notificados. Providenciar presença de todos.",
    urgente: false,
  },
  {
    id: "m4",
    data: "2023-05-02T11:00:00",
    tipo: "Despacho",
    descricao:
      "Cito o réu para responder à presente ação no prazo de 15 (quinze) dias. Intime-se. Cumpra-se.",
    resumoIa:
      "⚠️ CITAÇÃO DO RÉU: O réu foi citado e tem 15 dias para apresentar defesa. Aguardar manifestação da parte contrária.",
    urgente: false,
  },
  {
    id: "m5",
    data: "2023-03-12T10:00:00",
    tipo: "Distribuição",
    descricao:
      "Processo distribuído para a 14ª Vara Cível — Foro Central da Comarca de São Paulo. Recebida a petição inicial. Determinada a emenda em 10 dias para juntada de documentos complementares.",
    resumoIa: "🏛️ INÍCIO DO PROCESSO: Ação foi protocolada e distribuída para a vara responsável. Aguardar despacho inicial do juiz.",
    urgente: false,
  },
];

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
  const [expandedMov, setExpandedMov] = useState<string | null>("m1");
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [aiResumos, setAiResumos] = useState<Record<string, string>>({});

  async function gerarResumoIa(movId: string, descricao: string) {
    setLoadingAi(movId);
    // Simula chamada de IA (em produção chama /api/ai/resumo)
    await new Promise((r) => setTimeout(r, 2000));
    setAiResumos((prev) => ({
      ...prev,
      [movId]: "🤖 Resumo gerado pela IA: Esta é uma simulação. Em produção, o Gemini irá analisar o texto completo da decisão e gerar um resumo em linguagem clara para o advogado.",
    }));
    setLoadingAi(null);
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
                Ativo
              </span>
              <span className="badge badge-primary">{processoMock.tribunal}</span>
              <span className="badge badge-destructive">
                <AlertCircle className="w-2.5 h-2.5" />
                Nova decisão
              </span>
            </div>
            <code className="text-base font-mono font-bold text-foreground">{processoMock.numeroCnj}</code>
            <h1 className="font-display text-2xl font-bold text-primary mt-1">{processoMock.classe}</h1>
            <p className="text-muted-foreground text-sm mt-1">{processoMock.assunto}</p>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Órgão Julgador</p>
                <p className="text-sm font-medium text-foreground">{processoMock.orgaoJulgador}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Data de Distribuição</p>
                <p className="text-sm font-medium text-foreground">{processoMock.dataDistribuicao}</p>
              </div>
            </div>

            {/* Partes */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-border">
              {processoMock.partes.map((parte) => (
                <div key={parte.tipo}>
                  <p className="text-xs text-muted-foreground mb-0.5">{parte.tipo}</p>
                  <p className="text-sm font-medium text-foreground">{parte.nome}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-shrink-0">
            <button className="btn-accent text-sm py-2">
              <Bell className="w-4 h-4" />
              Configurar alerta
            </button>
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
            <span className="badge badge-primary ml-1">{movimentacoesMock.length}</span>
          </h2>
        </div>

        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-0">
            {movimentacoesMock.map((mov, i) => {
              const isExpanded = expandedMov === mov.id;
              const dotColor = tipoColors[mov.tipo] || "bg-primary";
              const resumo = aiResumos[mov.id] || mov.resumoIa;

              return (
                <motion.div
                  key={mov.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className="relative pb-6"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-5 w-3.5 h-3.5 rounded-full ${dotColor} border-2 border-white shadow-sm top-1.5`} />

                  <div
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      mov.urgente ? "border-red-200 bg-red-50/30" : "border-border bg-white"
                    } ${isExpanded ? "shadow-card" : "hover:border-primary/20 hover:bg-primary/1"}`}
                  >
                    {/* Header */}
                    <button
                      className="w-full text-left p-4 flex items-start justify-between gap-3"
                      onClick={() => setExpandedMov(isExpanded ? null : mov.id)}
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`badge text-white text-xs`} style={{ background: tipoColors[mov.tipo] || "#0F1B35" }}>
                            <Gavel className="w-2.5 h-2.5" />
                            {mov.tipo}
                          </span>
                          {mov.urgente && (
                            <span className="badge badge-destructive">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Nova
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

                    {/* Expandable content */}
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
                            {/* Full text */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Texto da Movimentação
                              </p>
                              <p className="text-sm text-foreground leading-relaxed bg-muted/50 rounded-lg p-4">
                                {mov.descricao}
                              </p>
                            </div>

                            {/* AI Summary */}
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
                                onClick={() => gerarResumoIa(mov.id, mov.descricao)}
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
