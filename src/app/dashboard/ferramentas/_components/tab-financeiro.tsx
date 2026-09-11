"use client";

import { useState } from "react";
import { DollarSign as MoneyIcon, FileText } from "lucide-react";

interface Lancamento {
  id: number;
  data: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  cliente: string;
  categoria: string;
  valor: number;
  status: string;
}

export default function TabFinanceiro() {
  const [finTipo, setFinTipo] = useState<"receita" | "despesa">("receita");
  const [finDescricao, setFinDescricao] = useState("");
  const finCategoria = "Honorários Pró-Labore";
  const [finCliente, setFinCliente] = useState("");
  const [finValor, setFinValor] = useState("");
  
  const [finLancamentos, setFinLancamentos] = useState<Lancamento[]>([
    { id: 1, data: "01/09/2026", tipo: "receita", descricao: "Honorários Iniciais - Processo XYZ", cliente: "Empresa Alpha Ltda", categoria: "Honorários Pró-Labore", valor: 5000.00, status: "Pago" },
    { id: 2, data: "03/09/2026", tipo: "despesa", descricao: "Custas Iniciais TJSP", cliente: "João da Silva", categoria: "Custas", valor: 250.00, status: "Pago" },
    { id: 3, data: "05/09/2026", tipo: "receita", descricao: "Sucumbência - Alvará", cliente: "Condomínio Flores", categoria: "Sucumbência", valor: 3200.00, status: "Pendente" },
  ]);

  function adicionarLancamento() {
    if (!finDescricao || !finValor) return;
    setFinLancamentos((prev) => [
      {
        id: Date.now(),
        data: new Date().toLocaleDateString("pt-BR"),
        tipo: finTipo,
        descricao: finDescricao,
        cliente: finCliente || "-",
        categoria: finCategoria,
        valor: parseFloat(finValor),
        status: "Pago",
      },
      ...prev,
    ]);
    setFinDescricao("");
    setFinValor("");
    setFinCliente("");
  }

  const receitas = finLancamentos.filter(l => l.tipo === "receita" && l.status === "Pago").reduce((acc, l) => acc + l.valor, 0);
  const despesas = finLancamentos.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0);
  const pendentes = finLancamentos.filter(l => l.status === "Pendente").reduce((acc, l) => acc + l.valor, 0);

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          <MoneyIcon className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Gestão Financeira & Honorários</h2>
          <p className="text-emerald-200 text-sm">Controle de caixa do escritório, faturamento e honorários sucumbenciais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receitas do Mês</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            R$ {receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card p-5 border-l-4 border-l-red-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Despesas / Custas</span>
          <p className="text-2xl font-black text-red-600 mt-1">
            R$ {despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card p-5 border-l-4 border-l-amber-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">A Receber (Pendente)</span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            R$ {pendentes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MoneyIcon className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-900 text-base">Novo Lançamento</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={finTipo} onChange={(e) => setFinTipo(e.target.value as "receita" | "despesa")}>
              <option value="receita">🟢 Receita (Entrada)</option>
              <option value="despesa">🔴 Despesa (Saída)</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="label">Descrição</label>
            <input type="text" className="input" placeholder="Ex: Honorários..." value={finDescricao} onChange={(e) => setFinDescricao(e.target.value)} />
          </div>
          <div>
            <label className="label">Valor (R$)</label>
            <input type="number" className="input" placeholder="0,00" value={finValor} onChange={(e) => setFinValor(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={adicionarLancamento} disabled={!finDescricao || !finValor} className="btn-primary bg-emerald-700 w-full py-2.5 px-3">
              + Registrar
            </button>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Extrato Financeiro</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Descrição</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finLancamentos.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3 text-slate-500 font-mono">{item.data}</td>
                  <td className="p-3 font-extrabold text-[10px]">{item.tipo === "receita" ? <span className="text-emerald-700">+ RECEITA</span> : <span className="text-red-700">- DESPESA</span>}</td>
                  <td className="p-3 font-bold text-slate-900">{item.descricao}</td>
                  <td className={`p-3 font-mono font-bold ${item.tipo === "receita" ? "text-emerald-700" : "text-red-600"}`}>R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${item.status === "Pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
