"use client";

import { FileText } from "lucide-react";

export default function TabVademecum() {
  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <FileText className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Vade Mecum Digital & Legislação Brasileira</h2>
          <p className="text-amber-200 text-sm">Acesso rápido aos principais códigos, leis secas, súmulas e normas com atualização oficial contínua (Planalto).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { titulo: "Constituição Federal de 1988", sub: "CF/88 — Norma Suprema", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm", badge: "CF/88", desc: "Direitos fundamentais, organização do Estado e ordem social." },
          { titulo: "Código de Processo Civil", sub: "Lei nº 13.105/2015", url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm", badge: "CPC", desc: "Prazos em dias úteis, tutela provisória, recursos e execução." },
          { titulo: "Consolidação das Leis do Trabalho", sub: "Decreto-Lei nº 5.452/1943", url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm", badge: "CLT", desc: "Contratos de trabalho, jornada, verbas rescisórias e processo trabalhista." },
          { titulo: "Código Penal Brasileiro", sub: "Decreto-Lei nº 2.848/1940", url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm", badge: "CP", desc: "Crimes, penas, dosimetria e causas de extinção da punibilidade." },
          { titulo: "Código Civil Brasileiro", sub: "Lei nº 10.406/2002", url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm", badge: "CC", desc: "Obrigações, contratos, família, sucessões e direitos reais." },
          { titulo: "Código de Defesa do Consumidor", sub: "Lei nº 8.078/1990", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm", badge: "CDC", desc: "Direitos do consumidor, responsabilidade objetiva e práticas abusivas." },
        ].map((item, idx) => (
          <div key={idx} className="card hover:border-amber-400 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">{item.badge}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">Texto Compilado</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{item.titulo}</h3>
              <p className="text-xs text-amber-700 font-medium">{item.sub}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs w-full justify-center py-2.5 mt-2">
              Consultar ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
