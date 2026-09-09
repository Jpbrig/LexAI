"use client";

import { Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calculator,
  Search,
  Layers,
  FileSignature,
  Bot,
  Globe,
  FileText,
  DollarSign as MoneyIcon,
  Scale,
} from "lucide-react";

// Lazy load components
const TabCalculadoras = lazy(() => import("./_components/tab-calculadoras"));
const TabConsultas = lazy(() => import("./_components/tab-consultas"));
const TabOutros = lazy(() => import("./_components/tab-outros"));
const TabProcuracao = lazy(() => import("./_components/tab-procuracao"));
const TabPeticoes = lazy(() => import("./_components/tab-peticoes"));
const TabAssistente = lazy(() => import("./_components/tab-assistente"));
const TabAssinatura = lazy(() => import("./_components/tab-assinatura"));
const TabJurisprudencia = lazy(() => import("./_components/tab-jurisprudencia"));
const TabFinanceiro = lazy(() => import("./_components/tab-financeiro"));
const TabVademecum = lazy(() => import("./_components/tab-vademecum"));

type FerramentaTab =
  | "calculadoras"
  | "consultas"
  | "outros"
  | "procuracao"
  | "peticoes"
  | "assistente"
  | "assinatura"
  | "jurisprudencia"
  | "financeiro"
  | "vademecum";

const ferramentaTabs: FerramentaTab[] = [
  "calculadoras",
  "consultas",
  "outros",
  "procuracao",
  "peticoes",
  "assistente",
  "assinatura",
  "jurisprudencia",
  "financeiro",
  "vademecum",
];

function isFerramentaTab(value: string | null): value is FerramentaTab {
  return value !== null && ferramentaTabs.some((tab) => tab === value);
}

function TabFallback() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}

function FerramentasContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: FerramentaTab = isFerramentaTab(tabParam) ? tabParam : "calculadoras";

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ferramentas Jurídicas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cálculos, peças processuais, inteligência artificial e utilitários para o seu dia a dia.
        </p>
      </header>

      {/* Navegação de Abas (Horizontal com Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-slate-200">
        {[
          { id: "calculadoras", label: "Cálculos", icon: Calculator, color: "text-indigo-600" },
          { id: "peticoes", label: "Petições IA", icon: FileText, color: "text-amber-600" },
          { id: "assistente", label: "Assistente IA", icon: Bot, color: "text-amber-500" },
          { id: "procuracao", label: "Procuração IA", icon: FileSignature, color: "text-amber-600" },
          { id: "assinatura", label: "Assinatura ClicSign", icon: FileSignature, color: "text-emerald-600" },
          { id: "jurisprudencia", label: "Jurisprudências", icon: Scale, color: "text-amber-600" },
          { id: "financeiro", label: "Financeiro & Hon.", icon: MoneyIcon, color: "text-emerald-600" },
          { id: "vademecum", label: "Vade Mecum", icon: Globe, color: "text-amber-700" },
          { id: "consultas", label: "Consultas Públicas", icon: Search, color: "text-blue-600" },
          { id: "outros", label: "Recursos Úteis", icon: Layers, color: "text-purple-600" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("tab", tab.id);
                window.history.pushState({}, "", url.toString());
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <Suspense fallback={<TabFallback />}>
          {activeTab === "calculadoras" && <TabCalculadoras />}
          {activeTab === "consultas" && <TabConsultas />}
          {activeTab === "outros" && <TabOutros />}
          {activeTab === "procuracao" && <TabProcuracao />}
          {activeTab === "peticoes" && <TabPeticoes />}
          {activeTab === "assistente" && <TabAssistente />}
          {activeTab === "assinatura" && <TabAssinatura />}
          {activeTab === "jurisprudencia" && <TabJurisprudencia />}
          {activeTab === "financeiro" && <TabFinanceiro />}
          {activeTab === "vademecum" && <TabVademecum />}
        </Suspense>
      </div>
    </div>
  );
}

export default function FerramentasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Carregando ferramentas...</div>}>
      <FerramentasContent />
    </Suspense>
  );
}
