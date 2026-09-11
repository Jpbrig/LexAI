"use client";

import { useState } from "react";
import { FileSignature, Sparkles, Printer, User, Info, AlertCircle, FileCheck } from "lucide-react";

export default function TabProcuracao() {
  const [tipoProcuracao, setTipoProcuracao] = useState("ad_judicia");
  const [outorganteNome, setOutorganteNome] = useState("João da Silva");
  const [outorganteEstadoCivil, setOutorganteEstadoCivil] = useState("solteiro(a)");
  const [outorganteProfissao, setOutorganteProfissao] = useState("");
  const [outorganteCpf, setOutorganteCpf] = useState("123.456.789-00");
  const [outorganteRg, setOutorganteRg] = useState("12.345.678-9 SSP/SP");
  const [outorganteEndereco, setOutorganteEndereco] = useState("Rua das Flores, 123 - São Paulo/SP");
  const [outorganteCidade, setOutorganteCidade] = useState("");
  
  const [outorgadoAdvogado, setOutorgadoAdvogado] = useState("Dr. Usuário Teste");
  const [outorgadoOab, setOutorgadoOab] = useState("SP 123456");
  
  const [procObjeto, setProcObjeto] = useState("");
  const [textoProcuracao, setTextoProcuracao] = useState("");
  const [loadingProcuracao, setLoadingProcuracao] = useState(false);
  const [erroProcuracao, setErroProcuracao] = useState("");
  const [procUploadFileName, setProcUploadFileName] = useState("");

  async function gerarProcuracaoIA() {
    setLoadingProcuracao(true);
    setErroProcuracao("");
    setTextoProcuracao("");
    try {
      const res = await fetch("/api/peticoes/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoPeca: `procuracao_${tipoProcuracao}`,
          requerente: outorganteNome,
          requerido: outorgadoAdvogado,
          juizo: outorganteCidade,
          numeroProcesso: "",
          fatos: `Outorgante: ${outorganteNome}, ${outorganteEstadoCivil}, ${outorganteProfissao || "brasileiro(a)"}, CPF ${outorganteCpf}, RG ${outorganteRg}, residente em ${outorganteEndereco}${outorganteCidade ? ", " + outorganteCidade : ""}. Outorgado: ${outorgadoAdvogado}, OAB ${outorgadoOab}. Tipo: ${tipoProcuracao}. Objeto: ${procObjeto || "poderes gerais para o foro."}`,
          pedidos: procObjeto,
          valorCausa: "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setTextoProcuracao(data.texto);
      } else {
        setErroProcuracao(data.error || "Não consegui gerar a procuração agora. Revise os dados informados e tente novamente.");
      }
    } catch {
      setErroProcuracao("Não consegui conectar com o servidor no momento. Tente novamente em alguns instantes.");
    } finally {
      setLoadingProcuracao(false);
    }
  }

  function handleProcUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setProcObjeto((prev) => (prev ? prev + "\n\n[Modelo base]:\n" + content : content));
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <FileSignature className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Gerador de Procuração (IA)</h2>
          <p className="text-slate-300 text-sm">Crie procurações Ad Judicia, Extra Judicia ou Específicas automaticamente.</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileSignature className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-900 text-base">1. Tipo de Procuração</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { id: "ad_judicia", label: "Ad Judicia et Extra" },
            { id: "previdenciaria", label: "Específica Previdenciária (INSS)" },
            { id: "trabalhista", label: "Específica Trabalhista" },
            { id: "plenos_poderes", label: "Plenos Poderes (Geral)" },
          ].map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => setTipoProcuracao(tipo.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                tipoProcuracao === tipo.id
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-amber-300"
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-900 text-base">2. Dados das Partes</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dados do Outorgante (Cliente)</h3>
          </div>
          <div>
            <label className="label">Nome Completo</label>
            <input type="text" className="input" value={outorganteNome} onChange={(e) => setOutorganteNome(e.target.value)} />
          </div>
          <div>
            <label className="label">CPF / CNPJ</label>
            <input type="text" className="input" value={outorganteCpf} onChange={(e) => setOutorganteCpf(e.target.value)} />
          </div>
          <div>
            <label className="label">RG / Órgão Expedidor</label>
            <input type="text" className="input" value={outorganteRg} onChange={(e) => setOutorganteRg(e.target.value)} />
          </div>
          <div>
            <label className="label">Estado Civil</label>
            <input type="text" className="input" value={outorganteEstadoCivil} onChange={(e) => setOutorganteEstadoCivil(e.target.value)} />
          </div>
          <div>
            <label className="label">Profissão</label>
            <input type="text" className="input" value={outorganteProfissao} onChange={(e) => setOutorganteProfissao(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Endereço Completo</label>
            <input type="text" className="input" value={outorganteEndereco} onChange={(e) => setOutorganteEndereco(e.target.value)} />
          </div>
          <div>
            <label className="label">Cidade / Estado</label>
            <input type="text" className="input" value={outorganteCidade} onChange={(e) => setOutorganteCidade(e.target.value)} />
          </div>

          <div className="lg:col-span-3 mt-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dados do Outorgado (Advogado)</h3>
          </div>
          <div className="lg:col-span-2">
            <label className="label">Nome do Advogado / Sociedade</label>
            <input type="text" className="input" value={outorgadoAdvogado} onChange={(e) => setOutorgadoAdvogado(e.target.value)} />
          </div>
          <div>
            <label className="label">Nº OAB</label>
            <input type="text" className="input" value={outorgadoOab} onChange={(e) => setOutorgadoOab(e.target.value)} />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="label">Poderes Específicos ou Objeto (Opcional)</label>
          <textarea
            rows={3}
            className="input resize-y font-sans text-sm"
            placeholder="Descreva se há poderes específicos (ex: confessar, transigir, dar quitação) ou deixe em branco para poderes gerais."
            value={procObjeto}
            onChange={(e) => setProcObjeto(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Upload de Modelo Base (opcional)</label>
          <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${procUploadFileName ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50"}`}>
            <FileCheck className={`w-4 h-4 flex-shrink-0 ${procUploadFileName ? "text-emerald-500" : "text-slate-400"}`} />
            <span className={`text-xs font-medium truncate ${procUploadFileName ? "text-emerald-700" : "text-slate-500"}`}>
              {procUploadFileName || "Clique para anexar documento de referência (.txt ou .docx)"}
            </span>
            <input type="file" accept=".txt,.docx" className="hidden" onChange={handleProcUpload} />
          </label>
        </div>
      </div>

      <button
        onClick={gerarProcuracaoIA}
        disabled={loadingProcuracao || !outorganteNome || !outorgadoAdvogado}
        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {loadingProcuracao ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Redigindo Procuração com IA...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-400" />
            3. Gerar Procuração Mágica
          </>
        )}
      </button>

      {erroProcuracao && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Erro ao gerar procuração</p>
            <p className="text-sm mt-0.5">{erroProcuracao}</p>
          </div>
        </div>
      )}

      {textoProcuracao && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-slate-900 text-base">4. Procuração Gerada — Revise</span>
              <span className="badge badge-success text-[10px]">IA</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(textoProcuracao)}
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
            <span><strong>Atenção:</strong> Revise os dados e os poderes conferidos. A inteligência artificial gera um rascunho com base nas informações fornecidas.</span>
          </div>

          <textarea
            rows={20}
            className="w-full p-6 rounded-xl border border-slate-200 bg-white font-serif text-sm leading-relaxed text-slate-900 resize-y outline-none focus:ring-2 focus:ring-slate-300"
            value={textoProcuracao}
            onChange={(e) => setTextoProcuracao(e.target.value)}
            style={{ fontFamily: "'Georgia', serif", lineHeight: "1.8" }}
          />
        </div>
      )}
    </div>
  );
}
