"use client";

import { useState, useEffect } from "react";
import { Users, Search, Plus, Mail, Phone, MapPin, FileText, DollarSign, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";

type ProcessoVinculado = {
  numeroCnj: string;
  tribunal: string;
  acao: string;
};

type Cliente = {
  id: string;
  nome: string;
  tipo: "PF" | "PJ";
  documento: string; // CPF ou CNPJ
  email: string;
  telefone: string;
  cidade: string;
  processosCount: number;
  listaProcessos: ProcessoVinculado[];
  totalPago: number;
  status: "Ativo" | "Inativo";
  dataCadastro: string;
  observacoes: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  function carregarClientes() {
    setLoading(true);
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatados = data.map((c: any) => ({
            id: c.id,
            nome: c.nome,
            tipo: c.tipo as "PF" | "PJ",
            documento: c.documento,
            email: c.email,
            telefone: c.telefone,
            cidade: c.cidade,
            processosCount: 0,
            listaProcessos: [],
            totalPago: c.totalPago || 0,
            status: c.status as "Ativo" | "Inativo",
            dataCadastro: new Date(c.createdAt).toLocaleDateString("pt-BR"),
            observacoes: c.observacoes || "",
          }));
          setClientes(formatados);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar clientes:", err);
        setLoading(false);
      });
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const [busca, setBusca] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showModalNovo, setShowModalNovo] = useState(false);

  // Form de Novo Cliente
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [observacoes, setObservacoes] = useState("");

  async function handleSalvarCliente(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !documento) return;

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, tipo, documento, email, telefone, cidade, observacoes }),
      });

      if (res.ok) {
        carregarClientes();
        setShowModalNovo(false);
        setNome("");
        setDocumento("");
        setEmail("");
        setTelefone("");
        setCidade("");
        setObservacoes("");
      }
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
    }
  }

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.documento.includes(busca) ||
      c.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-500" />
            Gestão de Clientes (CRM Jurídico)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cadastro de clientes, histórico de atendimentos, processos vinculados e rentabilidade.
          </p>
        </div>
        <button onClick={() => setShowModalNovo(true)} className="btn-primary text-sm px-4 py-2.5 shadow-md">
          <Plus className="w-4 h-4 text-amber-400" />
          + Novo Cliente
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-amber-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Clientes</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{clientes.length} Cadastrados</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {clientes.filter((c) => c.tipo === "PF").length} Pessoa Física | {clientes.filter((c) => c.tipo === "PJ").length} Pessoa Jurídica
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento Acumulado</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            R$ {clientes.reduce((acc, c) => acc + c.totalPago, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Soma de honorários recebidos da carteira</p>
        </div>

        <div className="card p-5 border-l-4 border-l-blue-500 bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processos Ativos</span>
          <p className="text-2xl font-black text-blue-700 mt-1">
            {clientes.reduce((acc, c) => acc + c.processosCount, 0)} Ações Vinculadas
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Média de {(clientes.reduce((acc, c) => acc + c.processosCount, 0) / clientes.length).toFixed(1)} processos/cliente</p>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="card p-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none z-10" />
          <input
            type="text"
            className="input text-sm"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Buscar cliente por nome, CPF/CNPJ ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Cards de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cli) => (
          <div
            key={cli.id}
            onClick={() => setSelectedCliente(cli)}
            className="card hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  cli.tipo === "PJ" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {cli.tipo === "PJ" ? "PESSOA JURÍDICA" : "PESSOA FÍSICA"}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1 group-hover:text-amber-700 transition-colors">
                  {cli.nome}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{cli.documento}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{cli.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{cli.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{cli.cidade}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1 text-slate-700 font-bold">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>{cli.processosCount} Processos</span>
              </div>
              <div className="font-mono font-bold text-emerald-700">
                R$ {cli.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Drawer de Detalhes do Cliente */}
      {selectedCliente && (
        <div
          onClick={() => setSelectedCliente(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto space-y-6 shadow-2xl animate-fade-in cursor-default"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  selectedCliente.tipo === "PJ" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {selectedCliente.tipo === "PJ" ? "PESSOA JURÍDICA" : "PESSOA FÍSICA"}
                </span>
                <h2 className="font-bold text-slate-900 text-xl mt-1">{selectedCliente.nome}</h2>
                <p className="text-xs text-slate-500 font-mono">{selectedCliente.documento}</p>
              </div>
              <button
                onClick={() => setSelectedCliente(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Informações de Contato */}
            <div className="card space-y-3 bg-slate-50 border-slate-200">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Informações de Contato</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">{selectedCliente.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">{selectedCliente.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{selectedCliente.cidade}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Cadastrado em {selectedCliente.dataCadastro}</span>
                </div>
              </div>
            </div>

            {/* Rentabilidade & Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 bg-emerald-50 border-emerald-200 text-emerald-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Total Pago em Honorários</span>
                <p className="text-lg font-black mt-1">R$ {selectedCliente.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="card p-4 bg-amber-50 border-amber-200 text-amber-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Processos Ativos</span>
                <p className="text-lg font-black mt-1">{selectedCliente.processosCount} Ações</p>
              </div>
            </div>

            {/* Lista de Processos Vinculados */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Processos Vinculados ({selectedCliente.listaProcessos?.length || 0})
                </h3>
              </div>

              {selectedCliente.listaProcessos && selectedCliente.listaProcessos.length > 0 ? (
                <div className="space-y-2">
                  {selectedCliente.listaProcessos.map((proc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-amber-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono">
                          {proc.tribunal}
                        </span>
                        <a
                          href={`/dashboard/processos?busca=${proc.numeroCnj}`}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                        >
                          Ver no LexAI ↗
                        </a>
                      </div>
                      <p className="font-mono text-xs font-bold text-slate-900">{proc.numeroCnj}</p>
                      <p className="text-xs text-slate-600">{proc.acao}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhum processo vinculado cadastrado.</p>
              )}
            </div>

            {/* Observações / Histórico de Atendimento */}
            <div className="card space-y-2">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Anotações &amp; Histórico</h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedCliente.observacoes || "Nenhuma anotação registrada."}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <a
                href={`https://wa.me/55${selectedCliente.telefone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 justify-center text-xs py-3"
              >
                💬 Chamar no WhatsApp
              </a>
              <button
                onClick={() => setSelectedCliente(null)}
                className="btn-outline flex-1 justify-center text-xs py-3"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Novo Cliente */}
      {showModalNovo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSalvarCliente} className="card max-w-lg w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Cadastrar Novo Cliente
              </h2>
              <button type="button" onClick={() => setShowModalNovo(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Nome Completo / Razão Social</label>
                <input type="text" className="input" placeholder="Digite o nome..." value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div>
                <label className="label">Tipo de Pessoa</label>
                <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as "PF" | "PJ")}>
                  <option value="PF">Pessoa Física (PF)</option>
                  <option value="PJ">Pessoa Jurídica (PJ)</option>
                </select>
              </div>
              <div>
                <label className="label">{tipo === "PJ" ? "CNPJ" : "CPF"}</label>
                <input type="text" className="input" placeholder={tipo === "PJ" ? "00.000.000/0001-00" : "000.000.000-00"} value={documento} onChange={(e) => setDocumento(e.target.value)} required />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input type="email" className="input" placeholder="cliente@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input type="text" className="input" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Cidade / UF</label>
                <input type="text" className="input" placeholder="Ex: São Paulo / SP" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Anotações / Histórico Inicial</label>
                <textarea rows={3} className="input text-xs" placeholder="Observações sobre o cliente ou caso..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowModalNovo(false)} className="btn-outline text-xs px-4 py-2">Cancelar</button>
              <button type="submit" className="btn-primary text-xs px-5 py-2">Salvar Cliente</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
