"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  Scale,
  Unlock,
  Lock,
  Loader2,
} from "lucide-react";

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

type UserAdminItem = {
  id: string;
  name: string | null;
  email: string | null;
  oab: string | null;
  plano: string;
  platformRole: "USER" | "PLATFORM_ADMIN";
  lockedUntil: string | null;
  loginAttempts: number;
  createdAt: string;
  memberships: {
    id: string;
    role: string;
    status: string;
    workspace: { id: string; name: string };
  }[];
  _count: {
    processos: number;
    clientes: number;
  };
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
  const [usersList, setUsersList] = useState<UserAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [actionWorkspaceId, setActionWorkspaceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"workspaces" | "users" | "connectors" | "hierarchy">("users");

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
      await loadUsers();
    } catch (err) {
      console.error("Erro ao carregar stats do admin:", err);
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

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

    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setUsersList(data.users || []);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar usuários:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleUpdateUserRole(userId: string, newPlatformRole: "USER" | "PLATFORM_ADMIN") {
    setActionUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, platformRole: newPlatformRole }),
      });
      if (res.ok) {
        await loadUsers();
      }
    } catch (err) {
      console.error("Erro ao atualizar papel do usuário:", err);
    } finally {
      setActionUserId(null);
    }
  }

  async function handleUpdateUserPlan(userId: string, newPlan: string) {
    setActionUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plano: newPlan }),
      });
      if (res.ok) {
        await loadUsers();
        await handleRefresh();
      }
    } catch (err) {
      console.error("Erro ao atualizar plano do usuário:", err);
    } finally {
      setActionUserId(null);
    }
  }

  async function handleLockUser(userId: string) {
    setActionUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "lock" }),
      });
      if (res.ok) {
        await loadUsers();
      }
    } catch (err) {
      console.error("Erro ao bloquear usuário:", err);
    } finally {
      setActionUserId(null);
    }
  }

  async function handleUnlockUser(userId: string) {
    setActionUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "unlock" }),
      });
      if (res.ok) {
        await loadUsers();
      }
    } catch (err) {
      console.error("Erro ao desbloquear usuário:", err);
    } finally {
      setActionUserId(null);
    }
  }

  async function handleUpdateWorkspace(
    workspaceId: string,
    updates: Partial<Pick<WorkspaceAdminItem, "plano" | "status">>
  ) {
    setActionWorkspaceId(workspaceId);
    try {
      const res = await fetch(`/api/admin/organizations/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        await handleRefresh();
      }
    } catch (err) {
      console.error("Erro ao atualizar escritório:", err);
    } finally {
      setActionWorkspaceId(null);
    }
  }

  const filteredWorkspaces = stats?.workspaces.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerOab.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === "ALL" || w.plano === planFilter;

    return matchesSearch && matchesPlan;
  }) || [];

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.oab || "").toLowerCase().includes(userSearchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.platformRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header com Badge Admin Master */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
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
            Controle de usuários, permissões, escritórios, conectores oficiais e assinaturas SaaS.
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
                Usuários Totais
              </p>
              <p className="text-2xl font-black text-slate-900">
                {usersList.length || stats?.totalUsers || 0}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-2 border-t border-slate-100 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Advogados e administradores
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
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "users"
              ? "border-amber-500 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          👥 Gerenciamento de Usuários ({usersList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("workspaces")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
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
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
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
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "hierarchy"
              ? "border-amber-500 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          👑 Matriz de Permissões
        </button>
      </div>

      {/* ABA DE GERENCIAMENTO DE USUÁRIOS */}
      {activeTab === "users" && (
        <div className="card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900">Gerenciamento Completo de Usuários & Níveis de Acesso</h3>
              <p className="text-xs text-slate-500">
                Altere o cargo de qualquer usuário da plataforma (Promova a Admin Master ou altere planos de escritórios).
              </p>
            </div>

            {/* Controles de Busca e Filtro de Usuários */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail ou OAB..."
                  className="input text-xs pl-9 pr-3 py-1.5 w-64"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="input text-xs py-1.5 px-3 w-40"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Todos os Cargos</option>
                <option value="PLATFORM_ADMIN">👑 Admin Master</option>
                <option value="USER">👨‍⚖️ Usuário Comum</option>
              </select>
            </div>
          </div>

          {/* Tabela de Usuários */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Usuário / E-mail</th>
                  <th className="py-3 px-4 font-bold">OAB</th>
                  <th className="py-3 px-4 font-bold">Nível da Plataforma</th>
                  <th className="py-3 px-4 font-bold">Escritório (Tenant)</th>
                  <th className="py-3 px-4 font-bold">Plano</th>
                  <th className="py-3 px-4 font-bold">Processos</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Ações do Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        Carregando usuários da base de dados...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Nenhum usuário encontrado para a busca informada.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isLocked = Boolean(u.lockedUntil && new Date(u.lockedUntil) > new Date());
                    const isMaster = u.platformRole === "PLATFORM_ADMIN";
                    const isCurrentActionUser = actionUserId === u.id;
                    const workspaceName = u.memberships[0]?.workspace.name || "Sem escritório";
                    const wsRole = u.memberships[0]?.role || "MEMBER";

                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${isMaster ? "bg-amber-50/30" : ""}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isMaster ? "bg-amber-500 text-slate-900" : "bg-slate-200 text-slate-700"
                            }`}>
                              {(u.name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                {u.name || "Sem Nome"}
                                {isMaster && (
                                  <span className="text-[9px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-black uppercase">
                                    ADMIN MASTER
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {u.oab || "—"}
                        </td>
                        <td className="py-3 px-4">
                          {isMaster ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              PLATFORM_ADMIN
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 w-fit block">
                              USER (Advogado)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 text-[11px]">{workspaceName}</p>
                          <span className="text-[9px] text-slate-400 uppercase font-mono">{wsRole}</span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            disabled={isCurrentActionUser}
                            className="text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300"
                            value={u.plano}
                            onChange={(e) => handleUpdateUserPlan(u.id, e.target.value)}
                          >
                            <option value="FREE">FREE</option>
                            <option value="STARTER">STARTER</option>
                            <option value="PROFESSIONAL">PROFESSIONAL</option>
                            <option value="ESCRITORIO">ESCRITORIO</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {u._count.processos}
                        </td>
                        <td className="py-3 px-4">
                          {isLocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit">
                              <Lock className="w-3 h-3 text-rose-600" /> Bloqueado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isLocked ? (
                              <button
                                type="button"
                                disabled={isCurrentActionUser}
                                onClick={() => handleUnlockUser(u.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 flex items-center gap-1"
                                title="Desbloquear tentativas de login"
                              >
                                <Unlock className="w-3 h-3" /> Desbloquear
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isCurrentActionUser}
                                onClick={() => handleLockUser(u.id)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-300 flex items-center gap-1"
                                title="Bloquear acesso do usuário"
                              >
                                <Lock className="w-3 h-3" /> Bloquear
                              </button>
                            )}

                            {isMaster ? (
                              <button
                                type="button"
                                disabled={isCurrentActionUser}
                                onClick={() => handleUpdateUserRole(u.id, "USER")}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-300 transition-colors flex items-center gap-1"
                                title="Rebaixar para Usuário Comum"
                              >
                                Rebaixar a USER
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isCurrentActionUser}
                                onClick={() => handleUpdateUserRole(u.id, "PLATFORM_ADMIN")}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-[10px] font-bold shadow-sm transition-colors flex items-center gap-1"
                                title="Promover este usuário para Admin Master"
                              >
                                <ShieldCheck className="w-3 h-3 text-slate-900" /> Tornar Admin Master
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: Tabela de Escritórios Clientes */}
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
                        <select
                          disabled={actionWorkspaceId === w.id}
                          className="text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 min-w-[110px]"
                          value={w.plano}
                          onChange={(e) => handleUpdateWorkspace(w.id, { plano: e.target.value })}
                        >
                          <option value="FREE">FREE</option>
                          <option value="STARTER">STARTER</option>
                          <option value="PROFESSIONAL">PROFESSIONAL</option>
                          <option value="ESCRITORIO">ESCRITORIO</option>
                        </select>
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
                        <select
                          disabled={actionWorkspaceId === w.id}
                          className="text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 min-w-[120px]"
                          value={w.status}
                          onChange={(e) => handleUpdateWorkspace(w.id, { status: e.target.value })}
                        >
                          <option value="TRIALING">TRIALING</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PAST_DUE">PAST_DUE</option>
                          <option value="CANCELED">CANCELED</option>
                          <option value="INCOMPLETE">INCOMPLETE</option>
                          <option value="UNPAID">UNPAID</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: Conectores & APIs Globais */}
      {activeTab === "connectors" && (
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900">Conectores Oficiais & APIs Globais da Plataforma</h3>
              <p className="text-xs text-slate-500">
                Estas chaves alimentam o sistema para todos os escritórios clientes. Advogados não precisam configurá-las.
              </p>
            </div>
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

      {/* ABA 4: Hierarquia & Matriz de Permissões */}
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
                Gerencia todos os usuários e promove outros membros para Admin Master
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
                Pode desbloquear contas ou alterar o plano de qualquer usuário/escritório
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
