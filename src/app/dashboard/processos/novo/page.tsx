"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Loader2, Plus, Info, CheckCircle, UserCheck, Scale, FileText } from "lucide-react";

const tribunais = [
  "TJSP", "TJRJ", "TJMG", "TJRS", "TJPR", "TJSC", "TJBA", "TJPE", "TJCE", "TJGO",
  "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TRF6",
  "TRT1", "TRT2", "TRT3", "TRT4", "TRT15",
  "STJ", "STF", "TST", "TSE", "STM",
];

export default function NovoProcessoPage() {
  const router = useRouter();
  const [modoBusca, setModoBusca] = useState<"cnj" | "cpf">("cpf");
  const [numeroCnj, setNumeroCnj] = useState("");
  const [cpfNome, setCpfNome] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [notas, setNotas] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [foundCNJ, setFoundCNJ] = useState<null | { classe: string; assunto: string; orgaoJulgador: string }>(null);
  const [resultadosCPF, setResultadosCPF] = useState<any[]>([]);
  const [error, setError] = useState("");

  function formatCnj(value: string) {
    const nums = value.replace(/\D/g, "").slice(0, 20);
    let formatted = nums;
    if (nums.length > 7) formatted = `${nums.slice(0, 7)}-${nums.slice(7)}`;
    if (nums.length > 9) formatted = `${formatted.slice(0, 10)}.${formatted.slice(10)}`;
    if (nums.length > 13) formatted = `${formatted.slice(0, 15)}.${formatted.slice(15)}`;
    if (nums.length > 14) formatted = `${formatted.slice(0, 17)}.${formatted.slice(17)}`;
    if (nums.length > 16) formatted = `${formatted.slice(0, 20)}.${formatted.slice(20)}`;
    return formatted;
  }

  async function buscarCNJ() {
    if (!numeroCnj || numeroCnj.replace(/\D/g, "").length < 15) {
      setError("Informe o número CNJ completo.");
      return;
    }
    setLoading(true);
    setError("");
    setFoundCNJ(null);

    try {
      const res = await fetch("/api/datajud/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroCnj, tribunal }),
      });
      const data = await res.json();
      if (res.ok && data) {
        setFoundCNJ({
          classe: data.classe || "Ação Cível",
          assunto: data.assunto || "Responsabilidade Civil",
          orgaoJulgador: data.orgaoJulgador || "Vara Cível Central",
        });
        if (data.tribunal) setTribunal(data.tribunal);
      }
    } catch (err) {
      setError("Erro ao buscar no DataJud.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarCPF() {
    if (!cpfNome || cpfNome.trim().length < 3) {
      setError("Digite o CPF ou Nome do cliente.");
      return;
    }
    setLoading(true);
    setError("");
    setResultadosCPF([]);

    try {
      const res = await fetch("/api/jusbrasil/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termo: cpfNome }),
      });
      const data = await res.json();
      if (res.ok && data.processos) {
        setResultadosCPF(data.processos);
      } else {
        setError(data.error || "Nenhum processo encontrado para este CPF.");
      }
    } catch (err) {
      setError("Erro ao realizar busca por CPF no Jusbrasil.");
    } finally {
      setLoading(false);
    }
  }

  async function salvarProcessoUnico(p: any) {
    setSaving(true);
    try {
      const res = await fetch("/api/processos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroCnj: p.numeroCnj,
          tribunal: p.tribunal,
          classe: p.classe,
          assunto: p.assunto,
          orgaoJulgador: p.orgaoJulgador,
          notas,
        }),
      });

      if (res.ok) {
        router.push("/dashboard/processos");
      }
    } catch (err) {
      setError("Erro ao cadastrar processo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      <Link href="/dashboard/processos" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Meus Processos
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Adicionar Novo Processo</h1>
        <p className="text-slate-500 text-sm mt-1">
          Busque por <strong>CPF/Nome do Cliente (Jusbrasil)</strong> ou por <strong>Número CNJ (DataJud)</strong>.
        </p>
      </div>

      {/* Tabs Modo de Busca */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => { setModoBusca("cpf"); setError(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            modoBusca === "cpf"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-400" />
          Busca por CPF / Nome (Jusbrasil)
        </button>

        <button
          onClick={() => { setModoBusca("cnj"); setError(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            modoBusca === "cnj"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400" />
          Busca por Número CNJ (DataJud)
        </button>
      </div>

      {/* MODO BUSCA POR CPF / NOME */}
      {modoBusca === "cpf" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">CPF ou Nome do Cliente / Empresa *</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: 123.456.789-00 ou João da Silva"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={cpfNome}
                onChange={(e) => setCpfNome(e.target.value)}
              />
              <button
                onClick={buscarCPF}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Varrendo Jusbrasil..." : "Varrer Jusbrasil"}
              </button>
            </div>
            {error && <p className="text-rose-600 text-xs mt-2 flex items-center gap-1 font-medium"><Info className="w-3.5 h-3.5" />{error}</p>}
          </div>

          {/* Lista de Processos Encontrados por CPF */}
          {resultadosCPF.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {resultadosCPF.length} processos encontrados para este cliente no Jusbrasil:
              </h3>

              <div className="space-y-3">
                {resultadosCPF.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{p.tribunal}</span>
                        <code className="text-xs font-mono font-bold text-slate-900">{p.numeroCnj}</code>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{p.classe}</p>
                      <p className="text-[11px] text-slate-500">{p.orgaoJulgador} · Requerente: {p.parteRequerente}</p>
                    </div>

                    <button
                      onClick={() => salvarProcessoUnico(p)}
                      disabled={saving}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 flex-shrink-0"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-amber-400" />}
                      Adicionar ao LexAI
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* MODO BUSCA POR CNJ */}
      {modoBusca === "cnj" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Número do Processo CNJ *</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0000000-00.0000.0.00.0000"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                value={numeroCnj}
                onChange={(e) => setNumeroCnj(formatCnj(e.target.value))}
              />
              <button
                onClick={buscarCNJ}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Buscando..." : "Buscar no DataJud"}
              </button>
            </div>
            {error && <p className="text-rose-600 text-xs mt-2 flex items-center gap-1 font-medium"><Info className="w-3.5 h-3.5" />{error}</p>}
          </div>

          {foundCNJ && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Processo localizado no DataJud!
              </p>
              <p className="text-xs text-emerald-900 font-semibold">{foundCNJ.classe} - {foundCNJ.assunto}</p>
              <p className="text-[11px] text-emerald-700">{foundCNJ.orgaoJulgador}</p>
              <button
                onClick={() => salvarProcessoUnico({ numeroCnj, tribunal: tribunal || "TJSP", ...foundCNJ })}
                disabled={saving}
                className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "+ Confirmar Cadastro"}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
