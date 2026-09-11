"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FileText,
  Bell,
  TrendingUp,
  Plus,
  Activity,
  ArrowRight,
  Users,
  Sparkles,
  CheckCircle2,
  Target,
  Calendar,
  ShieldCheck,
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
  const [onboardingState, setOnboardingState] = useState<Record<string, boolean>>({
    workspace: false,
    processos: false,
    clientes: false,
    assistente: false,
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

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

  const normalizedOnboardingState = useMemo(() => ({
    workspace: false,
    processos: false,
    clientes: false,
    assistente: false,
    ...(data?.onboardingState ?? {}),
  }), [data?.onboardingState]);

  useEffect(() => {
    setOnboardingState(normalizedOnboardingState);
  }, [normalizedOnboardingState]);

  async function persistOnboardingState(nextState: Record<string, boolean>) {
    try {
      const response = await fetch("/api/dashboard/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: nextState }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { onboardingState?: Record<string, boolean> };
        if (payload.onboardingState) {
          setOnboardingState(payload.onboardingState);
        }
      }
    } catch {
      // Ignora erro de persistência e mantém o estado local da interface.
    }
  }

  if (loading) return <DashboardLoadingState />;

  const statsList = [
    {
      label: "Total de Processos",
      value: data?.stats?.totalProcessos ?? 0,
      icon: FileText,
      color: "bg-blue-500",
      change: "Tudo organizado no seu espaço",
      delta: "+12%",
    },
    {
      label: "Movimentações Hoje",
      value: data?.stats?.movimentacoesHoje ?? 0,
      icon: Activity,
      color: "bg-amber-500",
      change: "Atualizadas em tempo real",
      delta: "+8%",
    },
    {
      label: "Alertas Ativos",
      value: data?.stats?.totalAlertas ?? 0,
      icon: Bell,
      color: "bg-green-500",
      change: "Sempre sob controle",
      delta: "3 críticos",
    },
    {
      label: "Resumos com IA",
      value: data?.recentMovimentacoes?.filter((m) => m.resumoIa).length ?? 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "Feitos para você",
      delta: "+5 hoje",
    },
  ];

  const performanceMetrics = [
    { label: "Processos ativos", value: data?.stats?.processosAtivos ?? 0, max: 24, color: "bg-indigo-500" },
    { label: "Movimentações", value: data?.stats?.movimentacoesHoje ?? 0, max: 18, color: "bg-amber-500" },
    { label: "Alertas resolvidos", value: Math.max((data?.stats?.totalAlertas ?? 0) - 2, 0), max: 14, color: "bg-emerald-500" },
  ];

  const onboardingChecklist = [
    {
      id: "workspace",
      title: "Organize seu workspace",
      description: "Configure preferências, alertas e a estrutura inicial do seu escritório.",
      href: "/dashboard/configuracoes",
      number: 1,
    },
    {
      id: "processos",
      title: "Cadastre seu primeiro processo",
      description: "Registre o caso, o cliente e acompanhe prazos desde o começo.",
      href: "/dashboard/processos/novo",
      number: 2,
    },
    {
      id: "clientes",
      title: "Revise clientes e contatos",
      description: "Centralize fichas, histórico e relacionamento em um único lugar.",
      href: "/dashboard/clientes",
      number: 3,
    },
    {
      id: "assistente",
      title: "Teste o assistente jurídico",
      description: "Faça uma pergunta, peça um resumo e veja o suporte da IA em ação.",
      href: "/dashboard/ferramentas?tab=assistente",
      number: 4,
    },
  ];

  const completedSteps = Object.values(onboardingState).filter(Boolean).length;
  const completionProgress = Math.round((completedSteps / onboardingChecklist.length) * 100);

  const toggleStep = (stepId: string) => {
    const nextState = {
      ...onboardingState,
      [stepId]: !onboardingState[stepId],
    };

    setOnboardingState(nextState);
    void persistOnboardingState(nextState);
  };

  const nextPendingStep = onboardingChecklist.find((step) => !onboardingState[step.id]) ?? onboardingChecklist[0];
  const currentStep = onboardingChecklist[currentOnboardingStep] ?? onboardingChecklist[0];

  const weeklyPerformanceData = useMemo(() => {
    const baseProcesses = Math.max(8, Math.min(30, (data?.stats?.totalProcessos ?? 0) / 2));
    const baseMovements = Math.max(5, Math.min(22, (data?.stats?.movimentacoesHoje ?? 0) + 4));
    const baseAlerts = Math.max(1, Math.min(12, (data?.stats?.totalAlertas ?? 0) + 1));

    return [
      { day: "Seg", processos: Math.round(baseProcesses * 0.82), movimentacoes: Math.round(baseMovements * 0.9), alertas: Math.round(baseAlerts * 0.75) },
      { day: "Ter", processos: Math.round(baseProcesses * 0.95), movimentacoes: Math.round(baseMovements * 1.05), alertas: Math.round(baseAlerts * 0.88) },
      { day: "Qua", processos: Math.round(baseProcesses * 1.05), movimentacoes: Math.round(baseMovements * 1.08), alertas: Math.round(baseAlerts * 0.96) },
      { day: "Qui", processos: Math.round(baseProcesses * 1.18), movimentacoes: Math.round(baseMovements * 1.12), alertas: Math.round(baseAlerts * 1.08) },
      { day: "Sex", processos: Math.round(baseProcesses * 1.24), movimentacoes: Math.round(baseMovements * 1.17), alertas: Math.round(baseAlerts * 1.12) },
      { day: "Sáb", processos: Math.round(baseProcesses * 0.91), movimentacoes: Math.round(baseMovements * 0.82), alertas: Math.round(baseAlerts * 0.7) },
      { day: "Dom", processos: Math.round(baseProcesses * 0.86), movimentacoes: Math.round(baseMovements * 0.78), alertas: Math.round(baseAlerts * 0.68) },
    ];
  }, [data?.stats?.totalProcessos, data?.stats?.movimentacoesHoje, data?.stats?.totalAlertas]);

  const teamPerformanceData = useMemo(() => [
    { name: "Processos", value: data?.stats?.processosAtivos ?? 0 },
    { name: "IA", value: Math.max(4, Math.round((data?.stats?.movimentacoesHoje ?? 0) / 2)) },
    { name: "Alertas", value: Math.max(1, data?.stats?.totalAlertas ?? 0) },
  ], [data?.stats?.processosAtivos, data?.stats?.movimentacoesHoje, data?.stats?.totalAlertas]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            Resumo do dia
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Olá, {data?.user?.name || "Dr. Usuário"}! 👋
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Seu escritório está com muito bom ritmo. Hoje o foco é manter processos, clientes e IA alinhados com o que você precisa.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="btn-outline"
          >
            Abrir onboarding
          </button>
          <Link href="/dashboard/processos/novo" className="btn-accent">
            <Plus className="w-4 h-4" />
            Adicionar processo
          </Link>
          <Link href="/dashboard/agenda" className="btn-outline">
            Ver agenda
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {statsList.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="card border-slate-200 bg-white/85 shadow-[0_20px_36px_-26px_rgba(15,27,53,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-22px_rgba(15,27,53,0.45)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} shadow-sm`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                {stat.delta}
              </span>
            </div>
            <div className="font-display text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{stat.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="card border-slate-200 bg-white/90 p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Evolução semanal
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Atividade do escritório</h2>
            </div>
            <div className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
              +18% vs. semana passada
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyPerformanceData}>
                <defs>
                  <linearGradient id="processosGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="movimentacoesGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", backgroundColor: "#fff" }}
                />
                <Area type="monotone" dataKey="processos" stroke="#818cf8" fill="url(#processosGradient)" strokeWidth={3} />
                <Area type="monotone" dataKey="movimentacoes" stroke="#f59e0b" fill="url(#movimentacoesGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="card border-slate-200 bg-white/90 p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Comparativo
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Foco operacional</h2>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
              bom desempenho
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformanceData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", backgroundColor: "#fff" }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="card overflow-hidden border-slate-200 bg-white/90 p-0"
        >
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-5 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  Performance overview
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  Operação do escritório em destaque
                </h2>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                Semana atual
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            {performanceMetrics.map((metric) => {
              const percent = Math.min(100, Math.round((metric.value / metric.max) * 100));

              return (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        {metric.label}
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-foreground">{metric.value}</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      {percent}%
                    </div>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${metric.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="card border-slate-200 bg-gradient-to-br from-amber-50 via-white to-slate-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                  Próximo passo
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-foreground">
                  {nextPendingStep.title}
                </h2>
              </div>
              <Target className="h-8 w-8 text-amber-500" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {nextPendingStep.description}
            </p>
            <Link href={nextPendingStep.href} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800">
              Continuar etapa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Checklist de início</h2>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                {completionProgress}%
              </div>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                style={{ width: `${completionProgress}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {completedSteps} de {onboardingChecklist.length} etapas concluídas.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="card p-0 overflow-hidden"
        >
          <div className="border-b border-slate-200 bg-slate-50/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Onboarding multi-step
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  Etapas do setup do escritório
                </h2>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                Persistido localmente
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {onboardingChecklist.map((step) => {
              const done = !!onboardingState[step.id];

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    done
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-pressed={done}
                      onClick={() => toggleStep(step.id)}
                      className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                        done
                          ? "border-emerald-300 bg-emerald-500 text-white"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                              done
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {done ? "Concluído" : "Pendente"}
                          </span>
                          <Link
                            href={step.href}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 transition-all hover:border-amber-300 hover:text-amber-700"
                          >
                            Abrir
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="card"
          >
            <h2 className="text-lg font-bold text-foreground">Estratégia operacional</h2>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Calendar className="mt-0.5 h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Organizar a semana</p>
                  <p className="text-xs text-muted-foreground">Defina o foco dos próximos dias antes de abrir mais demandas.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Validar prazos e alertas</p>
                  <p className="text-xs text-muted-foreground">Revise notificações e confirme o que precisa de atenção imediata.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Usar IA com contexto</p>
                  <p className="text-xs text-muted-foreground">Peça resumos e sugestões mais úteis para o seu perfil e rotina.</p>
                </div>
              </li>
            </ul>
          </motion.div>

          <RecentMovements
            movimentacoes={data?.recentMovimentacoes ?? []}
            isLoading={loading}
          />
        </div>
      </div>

      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  Setup guiado
                </p>
                <h3 className="mt-1 text-lg font-bold">Onboarding do escritório</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(false)}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-100"
              >
                Fechar
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Etapa {currentOnboardingStep + 1} de {onboardingChecklist.length}
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                  {Math.round(((currentOnboardingStep + 1) / onboardingChecklist.length) * 100)}%
                </div>
              </div>

              <div className="mb-5 flex gap-2">
                {onboardingChecklist.map((step, index) => {
                  const isActive = index === currentOnboardingStep;
                  const isDone = !!onboardingState[step.id];

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentOnboardingStep(index)}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        isDone
                          ? "bg-emerald-500"
                          : isActive
                            ? "bg-amber-500"
                            : "bg-slate-200"
                      }`}
                      aria-label={`Ir para etapa ${index + 1}`}
                    />
                  );
                })}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStep(currentStep.id)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      onboardingState[currentStep.id]
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {onboardingState[currentStep.id] ? "Concluído" : "Marcar concluído"}
                  </button>
                </div>

                <h4 className="text-xl font-bold text-foreground">{currentStep.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {currentStep.description}
                </p>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Dica útil
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {currentStep.id === "workspace" && "Comece pelos ajustes do escritório para garantir uma base clara para processos, alertas e clientes."}
                    {currentStep.id === "processos" && "Cadastre o caso principal agora para manter prazos, movimentações e próximas ações em um só lugar."}
                    {currentStep.id === "clientes" && "Uma ficha bem organizada acelera atendimento, relatórios e a estratégia de relacionamento com cada cliente."}
                    {currentStep.id === "assistente" && "Use o assistente com perguntas claras para receber resumos, propostas e apoio prático no seu dia a dia."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentOnboardingStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentOnboardingStep === 0}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Voltar
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOnboardingModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentOnboardingStep < onboardingChecklist.length - 1) {
                        setCurrentOnboardingStep((prev) => prev + 1);
                        return;
                      }
                      setShowOnboardingModal(false);
                    }}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white"
                  >
                    {currentOnboardingStep === onboardingChecklist.length - 1 ? "Concluir" : "Próximo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
