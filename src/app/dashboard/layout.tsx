"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Scale,
  LayoutDashboard,
  FileText,
  Calculator,
  Search,
  Sparkles,
  FileCheck,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Bot,
  FileSignature,
  DollarSign,
  Users,
  Calendar,
  ShieldCheck,
} from "lucide-react";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/processos", label: "Meus Processos", icon: FileText },
  { href: "/dashboard/clientes", label: "Meus Clientes (CRM)", icon: Users },
  { href: "/dashboard/agenda", label: "Agenda & Prazos", icon: Calendar },
];

const ferramentasNavItems = [
  { href: "/dashboard/ferramentas?tab=calculadoras", tab: "calculadoras", label: "Cálculos Jurídicos (13)", icon: Calculator },
  { href: "/dashboard/ferramentas?tab=consultas", tab: "consultas", label: "Consultas Legais (13)", icon: Search },
  { href: "/dashboard/ferramentas?tab=outros", tab: "outros", label: "Recursos & IA (2)", icon: Sparkles },
  { href: "/dashboard/ferramentas?tab=procuracao", tab: "procuracao", label: "Gerador de Procuração", icon: FileCheck },
  { href: "/dashboard/ferramentas?tab=peticoes", tab: "peticoes", label: "Petições IA (Gemini)", icon: Bot },
  { href: "/dashboard/ferramentas?tab=assistente", tab: "assistente", label: "I.A. Assistente Jurídico", icon: Sparkles },
  { href: "/dashboard/ferramentas?tab=jurisprudencia", tab: "jurisprudencia", label: "Pesquisador de Jurisprudências", icon: Scale },
  { href: "/dashboard/ferramentas?tab=vademecum", tab: "vademecum", label: "Vade Mecum Digital & Códigos", icon: FileText },
  { href: "/dashboard/ferramentas?tab=financeiro", tab: "financeiro", label: "Gestão Financeira & Honorários", icon: DollarSign },
  { href: "/dashboard/ferramentas?tab=assinatura", tab: "assinatura", label: "Assinatura Eletrônica (ClicSign)", icon: FileSignature },
];

const secondaryNavItems = [
  { href: "/dashboard/alertas", label: "Alertas", icon: Bell },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
      {/* Sidebar Colapsável Moderno */}
      <aside
        className={`
          bg-white border-r border-slate-200/80 flex flex-col justify-between
          transition-all duration-300 ease-in-out relative z-30 shadow-sm
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Floating Toggle Collapse Button on border */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-6 z-40 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all hover:scale-105"
          title={collapsed ? "Expandir Menu" : "Recolher Menu"}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Header Sidebar */}
          <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-4"} py-5 border-b border-slate-100 sticky top-0 bg-white z-10`}>
            <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-slate-800 transition-colors">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              {!collapsed && (
                <div className="flex flex-col leading-none">
                  <span className="font-display text-xl font-bold text-slate-900 tracking-tight">
                    Lex<span className="text-amber-500">AI</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                    Plataforma Jurídica
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-4">
            {/* Bloco Principal */}
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold
                      transition-all duration-200 group relative
                      ${
                        active
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        active ? "text-amber-400" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Bloco Ferramentas Separadas */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ferramentas Práticas
                </p>
              )}
              {ferramentasNavItems.map((item) => {
                const active = pathname.startsWith("/dashboard/ferramentas") && (
                  item.tab === (searchParams.get("tab") || "calculadoras")
                );
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 group relative
                      ${
                        active
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        active ? "text-amber-400" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Bloco Geral */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sistema
                </p>
              )}
              {session?.user?.platformRole === "PLATFORM_ADMIN" && (
                <Link
                  href="/dashboard/admin"
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold
                    transition-all duration-200 group relative
                    ${
                      pathname.startsWith("/dashboard/admin")
                        ? "bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20"
                        : "text-amber-600 hover:bg-amber-50 hover:text-amber-700 font-semibold"
                    }
                  `}
                  title={collapsed ? "Painel Admin Master" : undefined}
                >
                  <ShieldCheck
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      pathname.startsWith("/dashboard/admin") ? "text-slate-900" : "text-amber-500"
                    }`}
                  />
                  {!collapsed && <span className="truncate">Painel Admin Master</span>}
                </Link>
              )}
              {secondaryNavItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold
                      transition-all duration-200 group relative
                      ${
                        active
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        active ? "text-amber-400" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Footer User Info & Settings Shortcut */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-white">
          <Link
            href="/dashboard/configuracoes"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 bg-slate-100 group-hover:bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
              <User className="w-5 h-5 text-slate-700" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {session?.user?.name || "Seu perfil"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {session?.user?.email || "Perfil & configurações"}
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/auth/signin" })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sair do LexAI</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 h-16 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-2">
            {session?.user?.platformRole === "PLATFORM_ADMIN" ? (
              <span className="bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Modo Admin Master · Plataforma SaaS LexAI</span>
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Plano Escritório · {session?.role || "Advogado"}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {session?.user?.platformRole === "PLATFORM_ADMIN" ? (
              <Link
                href="/dashboard/admin"
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 border border-slate-800"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Painel Admin Master
              </Link>
            ) : (
              <Link
                href="/planos"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fazer Upgrade
              </Link>
            )}
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full min-w-0">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 font-medium">Carregando painel...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
