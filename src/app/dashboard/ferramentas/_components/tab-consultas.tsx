"use client";

import { useState } from "react";
import { Search, Building2, Car, Users, Globe, FileText, CheckCircle2 } from "lucide-react";
import type { GovQueryResponse } from "@/lib/types";

export default function TabConsultas() {
  const [selectedConsulta, setSelectedConsulta] = useState<string>("buscador");
  const [consultaCatFilter, setConsultaCatFilter] = useState<string>("todas");
  const [consultaTermo, setConsultaTermo] = useState<string>("");
  const [loadingGov, setLoadingGov] = useState(false);
  const [resultadoGov, setResultadoGov] = useState<GovQueryResponse | null>(null);
  const [errorGov, setErrorGov] = useState("");

  const buscarDadosGov = async () => {
    if (!consultaTermo.trim()) return;
    
    setLoadingGov(true);
    setErrorGov("");
    setResultadoGov(null);
    
    try {
      const res = await fetch(`/api/gov-query?termo=${encodeURIComponent(consultaTermo)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro na consulta");
      }
      
      setResultadoGov(data);
    } catch (err: unknown) {
      setErrorGov(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoadingGov(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
          <Search className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Central de Consultas (OSINT)</h2>
          <p className="text-slate-300 text-sm">Pesquisa unificada em bases públicas: CNPJ, Detran, Jusbrasil e Diários Oficiais.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "buscador", label: "Buscador Unificado (IA)", icon: Globe },
          { id: "empresas", label: "Empresas (CNPJ/QSA)", icon: Building2 },
          { id: "veiculos", label: "Veículos (Placa/Renavam)", icon: Car },
          { id: "pessoas", label: "Pessoas (CPF/Processos)", icon: Users },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedConsulta(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedConsulta === item.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="card space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            className="input flex-1"
            placeholder={
              selectedConsulta === "empresas" ? "Digite o CNPJ ou Razão Social..." :
              selectedConsulta === "veiculos" ? "Digite a Placa ou Chassi..." :
              selectedConsulta === "pessoas" ? "Digite o CPF ou Nome Completo..." :
              "Digite o termo para buscar em todas as bases..."
            }
            value={consultaTermo}
            onChange={(e) => setConsultaTermo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') buscarDadosGov();
            }}
          />
          <button 
            className="btn-primary px-6"
            onClick={buscarDadosGov}
            disabled={loadingGov || !consultaTermo.trim()}
          >
            {loadingGov ? "Buscando..." : "Pesquisar"}
          </button>
        </div>
      </div>

      {loadingGov && (
        <div className="card flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-600">Consultando bases públicas (API de Transparência)...</p>
          </div>
        </div>
      )}

      {errorGov && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
          {errorGov}
        </div>
      )}

      {resultadoGov && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Resultados Encontrados (Mock)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resultadoGov.data?.map((item, idx: number) => (
              <div key={idx} className="card bg-white border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-800">{item.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-100 text-blue-800 uppercase">
                    {item.source}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{item.snippet}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-bold mt-2 inline-block">
                    Acessar Fonte Oficial ↗
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="card bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Como a integração real com Serpro/Jusbrasil requer chaves pagas, este é um retorno simulado. Em produção, você verá os processos, CNPJs e certidões reais aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
