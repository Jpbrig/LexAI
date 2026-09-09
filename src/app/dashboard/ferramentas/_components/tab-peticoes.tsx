"use client";

import { useState } from "react";
import { Bot, FileText, User, FileCheck, Sparkles, AlertCircle, Printer, Info } from "lucide-react";

export default function TabPeticoes() {
  const [tipoPeca, setTipoPeca] = useState("inicial");
  const [pRequerente, setPRequerente] = useState("");
  const [pRequerido, setPRequerido] = useState("");
  const [pJuizo, setPJuizo] = useState("");
  const [pNumeroProcesso, setPNumeroProcesso] = useState("");
  const [pValorCausa, setPValorCausa] = useState("");
  const [pFatos, setPFatos] = useState("");
  const [pPedidos, setPPedidos] = useState("");
  
  const [loadingPeticao, setLoadingPeticao] = useState(false);
  const [erroPeticao, setErroPeticao] = useState("");
  const [textoPeticao, setTextoPeticao] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  async function gerarPeticaoIA() {
    setLoadingPeticao(true);
    setErroPeticao("");
    setTextoPeticao("");
    try {
      const res = await fetch("/api/peticoes/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoPeca,
          requerente: pRequerente,
          requerido: pRequerido,
          juizo: pJuizo,
          numeroProcesso: pNumeroProcesso,
          fatos: pFatos,
          pedidos: pPedidos,
          valorCausa: pValorCausa,
        }),
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setTextoPeticao(data.texto);
      } else {
        setErroPeticao(data.error || "Erro ao gerar a petição.");
      }
    } catch {
      setErroPeticao("Erro de conexão com o servidor.");
    } finally {
      setLoadingPeticao(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setPFatos((prev) => prev ? prev + "\n\n[Docs extraídos]:\n" + content : content);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <Bot className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Gerador de Petições IA</h2>
          <p className="text-slate-300 text-sm">Powered by Google Gemini — Peças processuais geradas por IA, revisadas por você.</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-900 text-base">1. Tipo de Peça Processual</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "inicial", label: "Petição Inicial", desc: "Art. 319 CPC" },
            { id: "contestacao", label: "Contestação", desc: "Art. 335 CPC" },
            { id: "recurso", label: "Recurso de Apelação", desc: "Art. 1.009 CPC" },
            { id: "replica", label: "Réplica", desc: "Art. 350 CPC" },
            { id: "agravo", label: "Agravo de Instrumento", desc: "Art. 1.015 CPC" },
            { id: "hc", label: "Habeas Corpus", desc: "Art. 647 CPP" },
            { id: "embargos", label: "Embargos de Declaração", desc: "Art. 1.022 CPC" },
          ].map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => setTipoPeca(tipo.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                tipoPeca === tipo.id
                  ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className={`text-xs font-bold ${tipoPeca === tipo.id ? "text-amber-700" : "text-slate-800"}`}>{tipo.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{tipo.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-900 text-base">2. Dados da Causa</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Requerente / Autor</label>
            <input type="text" className="input" placeholder="Nome completo ou Razão Social..." value={pRequerente} onChange={(e) => setPRequerente(e.target.value)} />
          </div>
          <div>
            <label className="label">Requerido / Réu</label>
            <input type="text" className="input" placeholder="Nome completo ou Razão Social..." value={pRequerido} onChange={(e) => setPRequerido(e.target.value)} />
          </div>
          <div>
            <label className="label">Juízo / Vara</label>
            <input type="text" className="input" placeholder="Ex: 3ª Vara Cível de São Paulo/SP" value={pJuizo} onChange={(e) => setPJuizo(e.target.value)} />
          </div>
          <div>
            <label className="label">Nº do Processo (se existente)</label>
            <input type="text" className="input" placeholder="Ex: 1002345-12.2024.8.26.0100" value={pNumeroProcesso} onChange={(e) => setPNumeroProcesso(e.target.value)} />
          </div>
          <div>
            <label className="label">Valor da Causa (R$)</label>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-300">
              <span className="px-3 text-slate-400 text-sm font-bold bg-slate-50 border-r border-slate-200 select-none flex items-center h-full">R$</span>
              <input type="number" placeholder="0,00" className="flex-1 px-3 py-2 text-sm font-semibold outline-none bg-white" value={pValorCausa} onChange={(e) => setPValorCausa(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Arquivo Modelo Base (opcional)</label>
            <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploadedFileName ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50"}`}>
              <FileCheck className={`w-4 h-4 flex-shrink-0 ${uploadedFileName ? "text-emerald-500" : "text-slate-400"}`} />
              <span className={`text-xs font-medium truncate ${uploadedFileName ? "text-emerald-700" : "text-slate-500"}`}>
                {uploadedFileName || "Clique para enviar .txt ou .docx"}
              </span>
              <input type="file" accept=".txt,.docx" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        <div>
          <label className="label">Narração dos Fatos (descreva detalhadamente)</label>
          <textarea
            rows={5}
            className="input resize-y font-sans text-sm"
            placeholder="Descreva os fatos relevantes ao caso: o que aconteceu, quando, como, consequências sofridas pelo autor..."
            value={pFatos}
            onChange={(e) => setPFatos(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Pedidos / Objeto da Demanda</label>
          <textarea
            rows={3}
            className="input resize-y font-sans text-sm"
            placeholder="Liste os pedidos: Ex: a) condenação ao pagamento de R$ X; b) declaração de nulidade do contrato; c) indenização por danos morais..."
            value={pPedidos}
            onChange={(e) => setPPedidos(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={gerarPeticaoIA}
        disabled={loadingPeticao || !pRequerente || !pRequerido || !pFatos}
        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingPeticao ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Gerando peça com Gemini IA...
          </>
        ) : (
          <>
            <Bot className="w-5 h-5 text-amber-400" />
            3. Gerar Petição com IA
          </>
        )}
      </button>

      {erroPeticao && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Erro ao gerar petição</p>
            <p className="text-sm mt-0.5">{erroPeticao}</p>
          </div>
        </div>
      )}

      {textoPeticao && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-slate-900 text-base">4. Editor da Petição — Revise e Edite</span>
              <span className="badge badge-success text-[10px]">Gerado por IA</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(textoPeticao)}
                className="btn-outline text-xs py-2 px-4"
              >
                📋 Copiar Texto
              </button>
              <button onClick={() => window.print()} className="btn-primary text-xs py-2 px-4">
                <Printer className="w-4 h-4 text-amber-400" />
                Imprimir / PDF
              </button>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Atenção:</strong> Esta peça é um rascunho gerado por IA. Revise, adapte ao caso concreto e assuma a responsabilidade técnica antes de protocolar.</span>
          </div>
          <textarea
            rows={30}
            className="w-full p-6 rounded-xl border border-slate-200 bg-white font-serif text-sm leading-relaxed text-slate-900 resize-y outline-none focus:ring-2 focus:ring-slate-300"
            value={textoPeticao}
            onChange={(e) => setTextoPeticao(e.target.value)}
            style={{ fontFamily: "'Georgia', serif", lineHeight: "1.8" }}
          />
        </div>
      )}
    </div>
  );
}
