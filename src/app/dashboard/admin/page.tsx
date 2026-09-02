"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  FileText,
  KeyRound,
  Search,
  RefreshCw,
  CheckCircle2,
  Scale,
} from "lucide-react";
import Link from "next/link";

type WorkspaceAdminItem = {
  id: string;
  name: string;
  plano: string;
  status: string;
  ownerName: string;
  ownerEmail: string;
  ownerOab: string;
  membersCount: number;
  processosCount: number;
  clientesCount: number;
  createdAt: string;
};

type AdminStats = {
  totalWorkspaces: number;
  totalUsers: number;
  totalProcessos: number;
  totalClientes: number;
  estimatedMrr: number;
  workspaces: WorkspaceAdminItem[];
};

export default function AdminMasterPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"workspaces" | "connectors" | "hierarchy">("workspaces");

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Erro ao carregar stats do admin:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar estatísticas:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredWorkspaces = stats?.workspaces.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerOab.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === "ALL" || w.plano === planFilter;

    return matchesSearch && matchesPlan;
  }) || [];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header com Badge Admin Master */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Painel do Admin Master
            </span>
            <span className="bg-slate-900 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
              PLATFORM_ADMIN
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestão Global da Plataforma LexAI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controle central de clientes, assinaturas, conectores oficiais e permissões SaaS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="btn-outline text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar Dados
          </button>
          <Link
            href="/dashboard/configuracoes"
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            Configurar Credenciais
          </Link>
        </div>
      </div>

      {/* KPI Cards — Visão Geral do Negócio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Receita Recorrente */}
        <div className="card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-amber-400" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                MRR Estimado (SaaS)
              </p>
              <p className="text-2xl font-black text-amber-400">
                R$ {(stats?.estimatedMrr || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2 border-t border-slate-700/50 pt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Receita total mensal dos planos ativos
          </p>
        </div>

        {/* Card 2: Total de Escritórios */}
        <div className="card p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Escritórios (Tenants)
              </p>
              <p className="text-2xl font-black text-slate-900">
                {stats?.totalWorkspaces || 0}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2 border-t border-slate-100 pt-2">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Clientes jurídicos cadastrados
          </p>
        </div>

        {/* Card 3: Total de Usuários */}
        <div className="card p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Advogados & Membros
              </p>
              <p className="text-2xl font-black text-slate-900">
                {stats?.totalUsers || 0}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2 border-t border-slate-100 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Usuários cadastrados no sistema
          </p>
        </div>

        {/* Card 4: Processos Monitorados */}
        <div className="card p-5 bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Processos Monitorados
              </p>
              <p className="text-2xl font-black text-slate-900">
                {stats?.totalProcessos || 0}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2 border-t border-slate-100 pt-2">
            <Scale className="w-3.5 h-3.5 text-purple-400" /> Sincronizados com DataJud & Tribunais
          </p>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("workspaces")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === "workspaces"
              ? "border-amber-500 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🏛️ Escritórios Clientes ({stats?.totalWorkspaces || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("connectors")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === "connectors"
              ? "border-amber-500 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          🔌 Conectores & APIs Globais (6)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hierarchy")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === "hierarchy"
              ? "border-amber-500 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          👑 Matriz de Permissões & Níveis
        </button>
      </div>

      {/* ABA 1: Tabela de Escritórios Clientes */}
      {activeTab === "workspaces" && (
        <div className="card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900">Gerenciamento de Escritórios Clientes</h3>
              <p className="text-xs text-slate-500">Visualize e controle os planos dos advogados associados à sua plataforma SaaS</p>
            </div>

            {/* Controles de Busca e Filtro */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar escritório, advogado, e-mail..."
                  className="input text-xs pl-9 pr-3 py-1.5 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="input text-xs py-1.5 px-3 w-36"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="ALL">Todos os Planos</option>
                <option value="FREE">Gratuito (FREE)</option>
                <option value="STARTER">Starter</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ESCRITORIO">Escritório</option>
              </select>
            </div>
          </div>

          {/* Tabela de Escritórios */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Escritório (Tenant)</th>
                  <th className="py-3 px-4 font-bold">Sócio Titular / E-mail</th>
                  <th className="py-3 px-4 font-bold">OAB</th>
                  <th className="py-3 px-4 font-bold">Plano</th>
                  <th className="py-3 px-4 font-bold">Membros</th>
                  <th className="py-3 px-4 font-bold">Processos</th>
                  <th className="py-3 px-4 font-bold">Cadastro</th>
                  <th className="py-3 px-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Carregando escritórios da base de dados...
                    </td>
                  </tr>
                ) : filteredWorkspaces.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Nenhum escritório encontrado para os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredWorkspaces.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>{w.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{w.ownerName}</p>
                        <p className="text-[11px] text-slate-400">{w.ownerEmail}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {w.ownerOab || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          w.plano === "PROFESSIONAL" || w.plano === "ESCRITORIO"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : w.plano === "STARTER"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {w.plano}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {w.membersCount}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {w.processosCount}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(w.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: Conectores & APIs Globais */}
      {activeTab === "connectors" && (
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900">Conectores Oficiais & APIs Globais da Plataforma</h3>
              <p className="text-xs text-slate-500">
                Estas chaves alimentam o sistema para todos os escritórios clientes. Advogados não precisam configurá-las.
              </p>
            </div>
            <Link
              href="/dashboard/configuracoes"
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              Gerenciar Chaves no Modal
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "🤖",
                title: "Google Gemini 1.5 Pro (IA Jurídica)",
                desc: "Petições Iniciais, Resumos Executivos de Processos e I.A. Assistente Jurídico por voz.",
                env: "GEMINI_API_KEY",
                status: "Ativo & Pronto",
              },
              {
                icon: "⚖️",
                title: "DataJud / CNJ (Busca Processual)",
                desc: "Pesquisa unificada em todos os tribunais do Brasil (STF, STJ, TJSP, TJRJ, TRF, etc.).",
                env: "DATAJUD_API_KEY",
                status: "Ativo & Gratuito",
              },
              {
                icon: "✍️",
                title: "ClicSign Assinaturas ICP-Brasil",
                desc: "Envio e coleta de assinaturas digitais de procurações e honorários.",
                env: "CLICSIGN_API_KEY",
                status: "Configuração SaaS",
              },
              {
                icon: "🏛️",
                title: "Serpro PGFN & CADIN",
                desc: "Consulta pública de certidões da Dívida Ativa da União e regularidade fiscal.",
                env: "SERPRO_CLIENT_ID",
                status: "Oficial PGFN",
              },
              {
                icon: "🚘",
                title: "SENATRAN / SINESP Veículos",
                desc: "Localização de veículos, restrições judiciais e dados de frota para execução.",
                env: "SENATRAN_CLIENT_ID",
                status: "Integração Nacional",
              },
              {
                icon: "📧",
                title: "Resend (Alertas por E-mail)",
                desc: "Envio de notificações de andamentos processuais e prazos fatais para clientes.",
                env: "RESEND_API_KEY",
                status: "Notificações SaaS",
              },
            ].map((api, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{api.icon}</span>
                    <h4 className="font-bold text-slate-900 text-xs">{api.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full">
                    {api.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{api.desc}</p>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[10px]">
                  <span className="text-slate-400 font-mono">ENV: {api.env}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Disponível para todos os clientes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: Hierarquia & Matriz de Permissões */}
      {activeTab === "hierarchy" && (
        <div className="card space-y-6">
          <div>
            <h3 className="font-bold text-slate-900">Matriz de Hierarquia SaaS & Níveis de Acesso</h3>
            <p className="text-xs text-slate-500">
              Estrutura de privilégios dividida em 2 camadas: Nível de Plataforma (Admin Master) e Nível de Escritório (Tenant Roles).
            </p>
          </div>

          {/* Camada 1: Admin Master */}
          <div className="p-5 rounded-2xl border-2 border-amber-400 bg-amber-50/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  CAMADA 1 — Platform Admin (Admin Master)
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  Você (Dono/Fundador da plataforma SaaS)
                </p>
              </div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-amber-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Gerencia todos os escritórios clientes e assinaturas Stripe
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Configura as chaves de API globais (Gemini, ClicSign, DataJud)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Acessa métricas financeiras globais (MRR, Churn, volume de requisições)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Pode suspender, ativar ou alterar o plano de qualquer escritório cliente
              </li>
            </ul>
          </div>

          {/* Camada 2: Workspace Roles */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              CAMADA 2 — Perfis do Escritório (Workspace Roles dos Advogados)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-bold rounded text-[10px]">
                  OWNER
                </span>
                <p className="font-bold text-slate-900">Sócio Titular / Admin do Escritório</p>
                <p className="text-[11px] text-slate-500">
                  Gerencia a equipe do escritório, convida membros, altera cartão de crédito e configura preferências locais.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                  ADMIN
                </span>
                <p className="font-bold text-slate-900">Sócio Associado</p>
                <p className="text-[11px] text-slate-500">
                  Acessa todos os processos e clientes do escritório, pode convidar membros e gerenciar permissões internas.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                  MEMBER
                </span>
                <p className="font-bold text-slate-900">Advogado Associado</p>
                <p className="text-[11px] text-slate-500">
                  Cria e edita processos, gera petições por IA, faz pesquisas jurisprudenciais e cadastra clientes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                  READ_ONLY
                </span>
                <p className="font-bold text-slate-900">Estagiário / Secretária</p>
                <p className="text-[11px] text-slate-500">
                  Apenas visualização de processos e agenda. Não pode utilizar a IA nem gerar documentos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
