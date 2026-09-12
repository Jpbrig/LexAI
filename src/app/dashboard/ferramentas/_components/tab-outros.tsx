"use client";

import { useState } from "react";
import {
  CreditCard,
  Award,
  Layers,
  ShieldAlert,
  FileText,
  ExternalLink,
  Plus,
} from "lucide-react";

type ResourceId = "custas" | "oab" | "modelos" | "lgpd" | "diligencias";

type Template = {
  id: string;
  title: string;
  category: string;
  content: string;
};

type Correspondente = {
  id: string;
  nome: string;
  papel: string;
  status: "Ativo" | "Pendente";
};

const recursosList = [
  {
    id: "custas",
    title: "Tabelas de Custas (TJ)",
    desc: "Links rápidos para guias DARE, custas e serviços oficiais dos tribunais estaduais.",
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    id: "oab",
    title: "Tabela da OAB (Honorários)",
    desc: "Consulta rápida da tabela mínima de honorários e materiais oficiais de apoio.",
    icon: Award,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
  {
    id: "modelos",
    title: "Banco de Modelos (Docs)",
    desc: "Repositório interno com modelos prontos para petições, procurações e contratos.",
    icon: Layers,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    id: "lgpd",
    title: "Compliance LGPD",
    desc: "Biblioteca de termos, políticas e materiais para conformidade e consentimento.",
    icon: ShieldAlert,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: "diligencias",
    title: "Gestão de Correspondentes",
    desc: "Controle simples de diligências terceirizadas, status e responsabilidades.",
    icon: FileText,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
] as const;

const linksCustas = [
  { label: "TJSP — DARE e custas", href: "https://www.tjsp.jus.br/" },
  { label: "TJRJ — informações e serviços", href: "https://www.tjrj.jus.br/" },
  { label: "TJMG — serviços e custas", href: "https://www.tjmg.jus.br/" },
  { label: "TRF-1 — serviços e peticionamento", href: "https://www.trf1.jus.br/" },
];

const linksOab = [
  { label: "OAB-SP — honorários e orientação", href: "https://www.oabsp.org.br/" },
  { label: "OAB-RJ — serviços e informações", href: "https://www.oabrj.org.br/" },
  { label: "OAB-MG — serviços do conselho", href: "https://www.oabmg.org.br/" },
  { label: "OAB Nacional — orientação profissional", href: "https://www.oab.org.br/" },
];

const modelos: Template[] = [
  {
    id: "contrato-honorarios",
    title: "Contrato de Honorários",
    category: "Contratos",
    content:
      "CONTRATO DE HONORÁRIOS\n\n1. Partes...\n2. Honorários...\n3. Prazo de pagamento...\n4. Responsabilidades...",
  },
  {
    id: "proc-curta",
    title: "Procuração Simples",
    category: "Procurações",
    content:
      "PROCURAÇÃO GERAL PARA FINS FORA DO JUÍZO\n\nOutorgante: ...\nOutorgado: ...\nObjetivo: ...\nPrazo: ...",
  },
  {
    id: "peticao-inicial",
    title: "Petição Inicial Modelo",
    category: "Petições",
    content:
      "PETIÇÃO INICIAL\n\n1. Qualificação das partes...\n2. Fatos...\n3. Direito...\n4. Pedidos...",
  },
];

const lgpdBlocks = [
  {
    title: "Termo de Consentimento",
    text:
      "CONSENTIMENTO LIVRE, ESCLARECIDO E INFORMADO. O cliente autoriza o uso de seus dados para fins de prestação de serviços advocatícios, comunicação e cumprimento legal.",
  },
  {
    title: "Política de Privacidade",
    text:
      "A banca coleta apenas dados necessários para a prestação dos serviços, armazena em ambiente seguro e não compartilha informações com terceiros sem autorização expressa.",
  },
  {
    title: "Retenção de Dados",
    text:
      "Os dados serão mantidos pelo período necessário à prestação do serviço, ao atendimento de obrigações legais e à defesa de direitos da banca e dos clientes.",
  },
];

const correspondentesSeed: Correspondente[] = [
  { id: "1", nome: "Cartório Central", papel: "Diligências e entrega", status: "Ativo" },
  { id: "2", nome: "Empresa de Citação", papel: "Serviços de citação", status: "Pendente" },
  { id: "3", nome: "Servidor de Arquivo", papel: "Recebimento de peças", status: "Ativo" },
];

export default function TabOutros() {
  const [selectedResource, setSelectedResource] = useState<ResourceId>("custas");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(modelos[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [correspondentes, setCorrespondentes] = useState<Correspondente[]>(correspondentesSeed);
  const [newCorrespondente, setNewCorrespondente] = useState<{
    nome: string;
    papel: string;
    status: "Ativo" | "Pendente";
  }>({ nome: "", papel: "", status: "Ativo" });

  const selectedTemplate = modelos.find((item) => item.id === selectedTemplateId) ?? modelos[0];

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      setCopiedKey(null);
    }
  }

  function toggleCorrespondenteStatus(id: string) {
    setCorrespondentes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Ativo" ? "Pendente" : "Ativo" }
          : item,
      ),
    );
  }

  function addCorrespondente() {
    if (!newCorrespondente.nome.trim() || !newCorrespondente.papel.trim()) return;

    setCorrespondentes((prev) => [
      {
        id: Date.now().toString(),
        nome: newCorrespondente.nome.trim(),
        papel: newCorrespondente.papel.trim(),
        status: newCorrespondente.status,
      },
      ...prev,
    ]);

    setNewCorrespondente({ nome: "", papel: "", status: "Ativo" });
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
          <Layers className="w-7 h-7 text-purple-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Recursos Adicionais & Repositório</h2>
          <p className="text-slate-300 text-sm">Links úteis, materiais oficiais e ferramentas internas do escritório.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recursosList.map((item) => {
          const Icon = item.icon;
          const isActive = selectedResource === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedResource(item.id)}
              className={`card hover:border-purple-300 transition-all text-left ${
                isActive ? "border-purple-400 bg-purple-50/50 shadow-sm" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card p-5">
        {selectedResource === "custas" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Tabelas de Custas (TJ)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Acesso rápido aos portals oficiais dos tribunais para consulta de despesas, DARE e serviços auxiliares.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linksCustas.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:border-slate-300 hover:bg-white"
                >
                  <span className="font-medium">{link.label}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {selectedResource === "oab" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Tabela da OAB (Honorários)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Materiais oficiais para consulta dos honorários e orientação profissional por conselho estadual.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linksOab.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:border-slate-300 hover:bg-white"
                >
                  <span className="font-medium">{link.label}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {selectedResource === "modelos" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Banco de Modelos (Docs)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Repositório interno com modelos prontos para uso, cópia rápida e reutilização do escritório.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                {modelos.map((modelo) => (
                  <button
                    key={modelo.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(modelo.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                      selectedTemplateId === modelo.id
                        ? "border-purple-300 bg-purple-50 text-purple-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold">{modelo.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{modelo.category}</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Modelo selecionado</p>
                    <h4 className="font-bold text-slate-900">{selectedTemplate.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(selectedTemplate.content, `modelo-${selectedTemplate.id}`)}
                    className="btn-outline text-[11px] px-3 py-1.5"
                  >
                    {copiedKey === `modelo-${selectedTemplate.id}` ? "Copiado" : "Copiar texto"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-700 bg-white border border-slate-200 rounded-xl p-3">
                  {selectedTemplate.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {selectedResource === "lgpd" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Compliance LGPD</h3>
              <p className="text-xs text-slate-500 mt-1">
                Modelos prontos para consentimento, política de privacidade e retenção de dados do escritório.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lgpdBlocks.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <button
                      type="button"
                      onClick={() => copyText(item.text, `lgpd-${item.title}`)}
                      className="text-[11px] text-purple-700 font-semibold"
                    >
                      {copiedKey === `lgpd-${item.title}` ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedResource === "diligencias" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">Gestão de Correspondentes</h3>
              <p className="text-xs text-slate-500 mt-1">
                Controle simples dos responsáveis por diligências, status e histórico do escritório.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-3">
                  {correspondentes.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.nome}</p>
                        <p className="text-[11px] text-slate-500">{item.papel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${
                            item.status === "Ativo"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCorrespondenteStatus(item.id)}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900"
                        >
                          Alternar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Adicionar correspondente</h4>
                <input
                  type="text"
                  className="input text-sm"
                  placeholder="Nome"
                  value={newCorrespondente.nome}
                  onChange={(e) => setNewCorrespondente((prev) => ({ ...prev, nome: e.target.value }))}
                />
                <input
                  type="text"
                  className="input text-sm"
                  placeholder="Papel / serviço"
                  value={newCorrespondente.papel}
                  onChange={(e) => setNewCorrespondente((prev) => ({ ...prev, papel: e.target.value }))}
                />
                <select
                  className="input text-sm"
                  value={newCorrespondente.status}
                  onChange={(e) =>
                    setNewCorrespondente((prev) => ({
                      ...prev,
                      status: e.target.value as "Ativo" | "Pendente",
                    }))
                  }
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Pendente</option>
                </select>
                <button type="button" onClick={addCorrespondente} className="btn-primary text-xs w-full justify-center">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
