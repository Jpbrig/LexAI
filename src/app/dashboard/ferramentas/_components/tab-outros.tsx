"use client";

import { CreditCard, Award, Briefcase, Layers, ShieldAlert, FileText } from "lucide-react";

export default function TabOutros() {
  const recursosList = [
    {
      id: "custas",
      title: "Tabelas de Custas (TJ)",
      desc: "Links rápidos para guias DARE e custas de todos os Tribunais de Justiça estaduais.",
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      id: "oab",
      title: "Tabela da OAB (Honorários)",
      desc: "Consulta rápida da tabela mínima de honorários da OAB do seu estado atualizada.",
      icon: Award,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      id: "stj",
      title: "Súmulas STJ / STF",
      desc: "Pesquisa indexada de todas as súmulas vinculantes e convencionais dos tribunais superiores.",
      icon: Briefcase,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      id: "modelos",
      title: "Banco de Modelos (Docs)",
      desc: "Acesso ao seu repositório pessoal de petições padrão, contratos e procurações salvas.",
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      id: "lgpd",
      title: "Compliance LGPD",
      desc: "Gerador de termos de consentimento e política de privacidade para clientes do escritório.",
      icon: ShieldAlert,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      id: "diligencias",
      title: "Gestão de Correspondentes",
      desc: "Módulo para controle de diligências terceirizadas, pagamentos e recebimentos de atas.",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
          <Layers className="w-7 h-7 text-purple-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Recursos Adicionais & Repositório</h2>
          <p className="text-slate-300 text-sm">Links úteis, tabelas oficiais e banco de modelos do escritório.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recursosList.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="card hover:border-purple-300 transition-colors group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
