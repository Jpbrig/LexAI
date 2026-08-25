"use client";

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
} from "lucide-react";

const stats = [
  { label: "Total de Processos", value: "12", icon: FileText, color: "bg-blue-500", change: "+2 este mês" },
  { label: "Movimentações Hoje", value: "3", icon: Activity, color: "bg-amber-500", change: "Atualizado agora" },
  { label: "Alertas Ativos", value: "8", icon: Bell, color: "bg-green-500", change: "Em 8 processos" },
  { label: "Resumos com IA", value: "24", icon: TrendingUp, color: "bg-purple-500", change: "Este mês" },
];

const recentMovimentacoes = [
  {
    id: "1",
    processo: "0012345-67.2023.8.26.0100",
    tribunal: "TJSP",
    tipo: "Sentença",
    descricao: "Julgado procedente o pedido do autor. Réu condenado ao pagamento de danos morais no valor de R$ 15.000,00.",
    data: "2026-08-25T10:30:00",
    urgente: true,
  },
  {
    id: "2",
    processo: "0098765-43.2022.4.03.6100",
    tribunal: "TRF3",
    tipo: "Despacho",
    descricao: "Intimem-se as partes para manifestação sobre a proposta de conciliação no prazo de 15 dias.",
    data: "2026-08-25T09:15:00",
    urgente: false,
  },
  {
    id: "3",
    processo: "0001122-33.2024.5.15.0001",
    tribunal: "TRT15",
    tipo: "Acórdão",
    descricao: "Recurso ordinário conhecido e provido. Condenação reformada para incluir horas extras não remuneradas.",
    data: "2026-08-24T16:45:00",
    urgente: true,
  },
  {
    id: "4",
    processo: "0055678-90.2021.8.19.0001",
    tribunal: "TJRJ",
    tipo: "Audiência",
    descricao: "Designada audiência de instrução e julgamento para o dia 15/09/2026 às 14:00 horas.",
    data: "2026-08-24T14:00:00",
    urgente: false,
  },
];

const processoStatus = [
  { status: "Ativo", count: 8, color: "bg-green-500" },
  { status: "Aguardando", count: 3, color: "bg-amber-500" },
  { status: "Arquivado", count: 1, color: "bg-gray-400" },
];

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
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Bom dia, Dr. Usuário 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Você tem <span className="font-semibold text-amber-600">3 movimentações</span> não lidas hoje.
          </p>
        </div>
        <Link href="/dashboard/processos/novo" className="btn-accent">
          <Plus className="w-4 h-4" />
          Adicionar Processo
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
            {recentMovimentacoes.map((mov) => (
              <Link
                key={mov.id}
                href={`/dashboard/processos/${mov.id}`}
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
            ))}
          </div>
        </motion.div>

        {/* Side column — 1/3 width */}
        <div className="space-y-4">
          {/* Status Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <h2 className="font-semibold text-foreground text-lg mb-4">Status da Carteira</h2>
            <div className="space-y-3">
              {processoStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-sm text-foreground">{s.status}</span>
                  </div>
                  <span className="font-semibold text-sm text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden flex">
              <div className="bg-green-500 h-full" style={{ width: "67%" }} />
              <div className="bg-amber-500 h-full" style={{ width: "25%" }} />
              <div className="bg-gray-400 h-full" style={{ width: "8%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">12 processos no total</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <h2 className="font-semibold text-foreground text-lg mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              <Link href="/dashboard/processos/novo" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                Adicionar processo
              </Link>
              <Link href="/dashboard/alertas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                Gerenciar alertas
              </Link>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                Sincronizar DataJud
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
