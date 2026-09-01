"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Bell,
  TrendingUp,
  Plus,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import type { DashboardResponse } from "@/lib/types";


function DashboardLoadingState() {
  return (
    <div
      className="space-y-8 animate-fade-in"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only" role="status">
        Carregando dashboard...
      </span>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl sm:w-44" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="card space-y-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentMovements movimentacoes={[]} isLoading />
        <div className="space-y-4">
          <div className="card space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="card space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarDashboard() {
      try {
        const response = await fetch("/api/dashboard", { signal: controller.signal });
        const responseData = (await response.json()) as DashboardResponse;
        setData(responseData);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void carregarDashboard();
    return () => controller.abort();
  }, []);

  if (loading) return <DashboardLoadingState />;

  const statsList = [
    { label: "Total de Processos", value: data?.stats?.totalProcessos ?? 0, icon: FileText, color: "bg-blue-500", change: "Banco Supabase" },
    { label: "Movimentações Hoje", value: data?.stats?.movimentacoesHoje ?? 0, icon: Activity, color: "bg-amber-500", change: "Em tempo real" },
    { label: "Alertas Ativos", value: data?.stats?.totalAlertas ?? 0, icon: Bell, color: "bg-green-500", change: "Monitorados" },
    { label: "Resumos com IA", value: data?.recentMovimentacoes?.filter((m) => m.resumoIa).length ?? 0, icon: TrendingUp, color: "bg-purple-500", change: "Gerados pela IA" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">
            Bom dia, {data?.user?.name || "Dr. Usuário"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Seu banco de dados no <span className="font-semibold text-primary">Supabase</span> está conectado e ativo.
          </p>
        </div>
        <Link href="/dashboard/processos/novo" className="btn-accent">
          <Plus className="w-4 h-4" />
          Adicionar Processo
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm font-medium text-foreground mt-1">{stat.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentMovements
          movimentacoes={data?.recentMovimentacoes ?? []}
          isLoading={loading}
        />

        {/* Side column — 1/3 width */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <h2 className="font-semibold text-foreground text-lg mb-4">Status da Carteira</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm text-foreground">Ativos</span>
                </div>
                <span className="font-semibold text-sm text-foreground">{data?.stats?.processosAtivos ?? 0}</span>
              </div>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden flex">
              <div className="bg-green-500 h-full w-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{data?.stats?.totalProcessos ?? 0} processos salvos no Supabase</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card bg-primary/5 border-primary/20"
          >
            <h2 className="font-semibold text-primary text-sm uppercase tracking-wider mb-2">Login de Teste</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Use estes dados para testar o sistema no Vercel:
            </p>
            <div className="bg-white rounded-lg p-3 border border-border text-xs font-mono space-y-1">
              <p><span className="text-muted-foreground">Email:</span> teste@lexai.com.br</p>
              <p><span className="text-muted-foreground">Senha:</span> 12345678</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
