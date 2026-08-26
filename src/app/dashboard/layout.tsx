"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  FileText,
  Calculator,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/processos", label: "Processos", icon: FileText },
  { href: "/dashboard/ferramentas", label: "Ferramentas & Cálculos", icon: Calculator },
  { href: "/dashboard/alertas", label: "Alertas", icon: Bell },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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
        <div>
          {/* Header Sidebar & Toggle Button */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              {!collapsed && (
                <span className="font-display text-xl font-bold text-slate-900 tracking-tight">
                  Lex<span className="text-amber-500">AI</span>
                </span>
              )}
            </div>

            {/* Toggle Collapse Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              title={collapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold
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
          </nav>
        </div>

        {/* Footer User Info & Settings Shortcut */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <Link
            href="/dashboard/configuracoes"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 bg-slate-100 group-hover:bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
              <User className="w-5 h-5 text-slate-700" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Dr. Usuário</p>
                <p className="text-[11px] text-slate-400 truncate">Perfil & Configurações</p>
              </div>
            )}
          </Link>

          <Link
            href="/auth/signin"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sair da Conta</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 h-16 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Plano Starter · 14 dias restantes
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/planos"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Fazer Upgrade
            </Link>
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
