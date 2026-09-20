"use client";

import { useState } from "react";
import { Scale, Search, CheckCircle2, Globe } from "lucide-react";

interface Jurisprudencia {
  tribunal: string;
  numeroProcesso: string;
  relator: string;
  dataPublicacao: string;
  titulo: string;
  ementa: string;
  citacaoPeticao?: string;
  fonteUrl?: string;
}

export default function TabJurisprudencia() {
  const [jurTermo, setJurTermo] = useState("");
  const [jurTribunal, setJurTribunal] = useState("TODOS");
  const [loadingJur, setLoadingJur] = useState(false);
  const [erroJur, setErroJur] = useState("");
  const [jurResultados, setJurResultados] = useState<Jurisprudencia[]>([]);
  const [copiadoId, setCopiadoId] = useState("");

  async function buscarJurisprudencia() {
    if (!jurTermo.trim()) return;
    setLoadingJur(true);
    setErroJur("");
    setJurResultados([]);

    try {
      const res = await fetch("/api/jurisprudencia/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termo: jurTermo, tribunal: jurTribunal }),
      });
      const data = await res.json();

      if (res.ok && data.sucesso) {
        setJurResultados(data.resultados);
      } else {
        setErroJur(data.error || "Falha ao buscar jurisprudência.");
      }
    } catch {
      setErroJur("Erro de conexão ao buscar jurisprudência.");
    } finally {
      setLoadingJur(false);
    }
  }

  function copiarCitacao(texto: string | undefined, id: string) {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(""), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <Scale className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Pesquisador de Jurisprudências Unificado</h2>
          <p className="text-slate-300 text-sm">Busca inteligente de acórdãos e súmulas nos acervos com citação pronta.</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Tribunal:</span>
          {[
            { id: "TODOS", label: "Todos" },
            { id: "STF", label: "STF" },
            { id: "STJ", label: "STJ" },
            { id: "TST", label: "TST" },
            { id: "TJSP", label: "TJSP" },
            { id: "TJRJ", label: "TJRJ" },
            { id: "TRF", label: "TRFs" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setJurTribunal(t.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                jurTribunal === t.id ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            className="input flex-1"
            placeholder="Ex: Dano moral extravio de bagagem..."
            value={jurTermo}
            onChange={(e) => setJurTermo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarJurisprudencia()}
          />
          <button
            onClick={buscarJurisprudencia}
            disabled={loadingJur || !jurTermo.trim()}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {loadingJur ? "Pesquisando..." : <><Search className="w-4 h-4 text-amber-400" /> Buscar</>}
          </button>
        </div>
      </div>

      {erroJur && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
          <p className="font-bold">Erro</p>
          <p>{erroJur}</p>
        </div>
      )}

      {jurResultados.length > 0 && (
        <div className="space-y-4">
          {jurResultados.map((item, idx) => (
            <div key={idx} className="card hover:border-amber-300 transition-all space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs px-2.5 py-1 bg-slate-900 text-amber-400 rounded-lg">{item.tribunal}</span>
                  <span className="font-bold text-slate-900 text-sm">{item.numeroProcesso}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">Relator: <strong className="text-slate-800">{item.relator}</strong> • {item.dataPublicacao}</div>
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-snug">{item.titulo}</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-serif text-slate-800 text-justify">
                {item.ementa}
              </div>

              {item.citacaoPeticao && (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Formatação ABNT:
                  </span>
                  <p className="font-mono text-[11px] text-amber-950 italic select-all">{item.citacaoPeticao}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button onClick={() => copiarCitacao(item.citacaoPeticao || item.ementa, String(idx))} className="btn-primary text-xs py-2 px-4">
                    {copiadoId === String(idx) ? "Copiada!" : "📋 Copiar Citação"}
                  </button>
                  <a
                    href={`/dashboard/ferramentas?tab=peticoes&fatos=${encodeURIComponent(`[Precedente ${item.tribunal} - ${item.numeroProcesso}]:\n${item.citacaoPeticao || item.ementa}`)}`}
                    className="btn-outline text-xs py-2 px-3 flex items-center gap-1 border-amber-500/30 text-amber-900 bg-amber-50 hover:bg-amber-100"
                  >
                    <span>📄 Usar na Petição</span>
                  </a>
                </div>
                <a href={item.fonteUrl || "#"} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Ver Fonte Oficial ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
