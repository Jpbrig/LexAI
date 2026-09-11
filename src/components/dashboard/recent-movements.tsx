"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Gavel,
} from "lucide-react";
import type { DashboardMovimentacao } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export type RecentMovementsProps = {
  movimentacoes: DashboardMovimentacao[];
  isLoading?: boolean;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) return `há ${hours}h`;

  const days = Math.floor(hours / 24);
  return `há ${days} dia${days > 1 ? "s" : ""}`;
}

function getTipoBadgeClass(tipo: string) {
  const map: Record<string, string> = {
    Sentença: "badge-destructive",
    Acórdão: "badge-primary",
    Despacho: "badge-warning",
    Audiência: "badge-success",
  };

  return map[tipo] || "badge-primary";
}

function MovementSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function RecentMovements({
  movimentacoes,
  isLoading = false,
}: RecentMovementsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card lg:col-span-2"
      aria-labelledby="recent-movements-title"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2
          id="recent-movements-title"
          className="text-lg font-semibold text-foreground"
        >
          Últimas movimentações
        </h2>
        <Link
          href="/dashboard/processos"
          className="flex shrink-0 items-center gap-1 text-sm text-primary transition-colors hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          Ver tudo <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div
        className="space-y-3"
        aria-busy={isLoading}
        aria-live={isLoading ? "polite" : undefined}
      >
        {isLoading ? (
          <>
            <span className="sr-only">Carregando movimentações recentes...</span>
            {Array.from({ length: 3 }, (_, index) => (
              <MovementSkeleton key={index} />
            ))}
          </>
        ) : movimentacoes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-sm font-medium text-foreground">Ainda não há movimentações por aqui.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Quando surgir algo novo, você verá os principais acontecimentos neste painel.
            </p>
          </div>
        ) : (
          movimentacoes.slice(0, 5).map((mov) => (
            <motion.div
              key={mov.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href={`/dashboard/processos/${mov.processoId}`}
                aria-label={`Ver detalhes do processo ${mov.processo}`}
                className="group block rounded-xl border border-border p-4 transition-all duration-150 hover:border-primary/30 hover:bg-primary/2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className={`badge ${getTipoBadgeClass(mov.tipo)}`}>
                        <Gavel className="h-2.5 w-2.5" aria-hidden="true" />
                        {mov.tipo}
                      </span>
                      {mov.urgente && (
                        <span className="badge badge-destructive">
                          <AlertCircle className="h-2.5 w-2.5" aria-hidden="true" />
                          Urgente
                        </span>
                      )}
                      <span className="badge badge-primary text-xs">
                        {mov.tribunal}
                      </span>
                    </div>
                    <p className="mb-1.5 font-mono text-xs text-muted-foreground">
                      {mov.processo}
                    </p>
                    <p className="line-clamp-2 text-sm leading-relaxed text-foreground">
                      {mov.descricao}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatDate(mov.data)}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
}
