"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Bell,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  Activity,
  Gavel,
  Loader2,
} from "lucide-react";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statsList = [
    { label: "Total de Processos", value: data?.stats?.totalProcessos ?? 0, icon: FileText, color: "bg-blue-500", change: "Banco Supabase" },
    { label: "Movimentações Hoje", value: data?.stats?.movimentacoesHoje ?? 0, icon: Activity, color: "bg-amber-500", change: "Em tempo real" },
    { label: "Alertas Ativos", value: data?.stats?.totalAlertas ?? 0, icon: Bell, color: "bg-green-500", change: "Monitorados" },
    { label: "Resumos com IA", value: data?.recentMovimentacoes?.filter((m: any) => m.resumoIa).length ?? 0, icon: TrendingUp, color: "bg-purple-500", change: "Gerados pela IA" },
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
        {/* Recent Movements — 2/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground text-lg">Movimentações Recentes</h2>
            <Link href="/dashboard/processos" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!data?.recentMovimentacoes || data.recentMovimentacoes.length === 0) ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma movimentação registrada no banco.</p>
            ) : (
              data.recentMovimentacoes.slice(0, 5).map((mov: any) => (
                <Link
                  key={mov.id}
                  href={`/dashboard/processos/${mov.processoId}`}
                  className="block p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/2 transition-all duration-150 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`badge ${getTipoBadgeClass(mov.tipo)}`}>
                          <Gavel className="w-2.5 h-2.5" />
                          {mov.tipo}
                        </span>
                        {mov.urgente && (
                          <span className="badge badge-destructive">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Urgente
                          </span>
                        )}
                        <span className="badge badge-primary text-xs">{mov.tribunal}</span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mb-1.5">{mov.processo}</p>
                      <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{mov.descricao}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(mov.data)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

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
