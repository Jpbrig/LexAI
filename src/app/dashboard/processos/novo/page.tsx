"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Loader2, Plus, Info, CheckCircle } from "lucide-react";

const tribunais = [
  "TJSP", "TJRJ", "TJMG", "TJRS", "TJPR", "TJSC", "TJBA", "TJPE", "TJCE", "TJGO",
  "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TRF6",
  "TRT1", "TRT2", "TRT3", "TRT4", "TRT15",
  "STJ", "STF", "TST", "TSE", "STM",
];

export default function NovoProcessoPage() {
  const router = useRouter();
  const [numeroCnj, setNumeroCnj] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<null | { classe: string; assunto: string; orgao: string }>(null);
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

  async function buscarDataJud() {
    if (!numeroCnj || numeroCnj.replace(/\D/g, "").length < 18) {
      setError("Informe o número CNJ completo (ex: 0012345-67.2023.8.26.0100)");
      return;
    }
    setLoading(true);
    setError("");
    setFound(null);

    // Simula busca no DataJud (em produção: /api/datajud/buscar)
    await new Promise((r) => setTimeout(r, 1500));
    setFound({
      classe: "Ação de Indenização por Danos Morais",
      assunto: "Responsabilidade Civil",
      orgao: "14ª Vara Cível — Foro Central",
    });
    setLoading(false);
  }

  async function salvarProcesso() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/dashboard/processos");
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <Link href="/dashboard/processos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Adicionar Processo</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Informe o número CNJ e buscamos automaticamente no DataJud.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium border border-border space-y-6"
      >
        {/* CNJ Input */}
        <div>
          <label className="label">
            Número do processo (formato CNJ) *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0000000-00.0000.0.00.0000"
              className={`input flex-1 font-mono ${error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}`}
              value={numeroCnj}
              onChange={(e) => {
                setNumeroCnj(formatCnj(e.target.value));
                setError("");
                setFound(null);
              }}
            />
            <button
              onClick={buscarDataJud}
              disabled={loading}
              className="btn-primary py-2.5 px-4 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {error && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><Info className="w-3 h-3" />{error}</p>}

          <div className="flex items-start gap-2 mt-2 p-3 bg-muted/50 rounded-lg">
            <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              O número CNJ segue o formato NNNNNNN-DD.AAAA.J.TT.OOOO. Você pode encontrá-lo na capa do processo ou no site do tribunal.
            </p>
          </div>
        </div>

        {/* Found result */}
        {found && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success/5 border border-success/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">Processo encontrado no DataJud</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Classe</p>
                <p className="font-medium text-foreground">{found.classe}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Assunto</p>
                <p className="font-medium text-foreground">{found.assunto}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-0.5">Órgão Julgador</p>
                <p className="font-medium text-foreground">{found.orgao}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tribunal */}
        <div>
          <label className="label">Tribunal</label>
          <select
            className="input"
            value={tribunal}
            onChange={(e) => setTribunal(e.target.value)}
          >
            <option value="">Selecione o tribunal...</option>
            {tribunais.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="label">Notas internas (opcional)</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Observações sobre este processo para uso interno..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
          />
        </div>

        {/* Alerts */}
        <div>
          <label className="label">Configurar alerta</label>
          <div className="grid grid-cols-2 gap-2">
            {["Qualquer movimentação", "Somente sentença", "Somente acórdão", "Audiências"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors">
                <input type="checkbox" className="accent-primary" defaultChecked={opt === "Qualquer movimentação"} />
                <span className="text-sm text-foreground">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/processos" className="btn-outline flex-1 justify-center">
            Cancelar
          </Link>
          <button
            onClick={salvarProcesso}
            disabled={!found || loading}
            className="btn-accent flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? "Salvando..." : "Adicionar processo"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
