"use client";

import { useState } from "react";
import { FileSignature, AlertCircle, FileCheck } from "lucide-react";

interface Envelope {
  id: string;
  docName: string;
  signerName: string;
  signerEmail: string;
  auth: string;
  date: string;
  status: string;
}

export default function TabAssinatura() {
  const [sigNomeSignatario, setSigNomeSignatario] = useState("");
  const [sigEmailSignatario, setSigEmailSignatario] = useState("");
  const [sigCpfSignatario, setSigCpfSignatario] = useState("");
  const [sigNomeDocumento, setSigNomeDocumento] = useState("");
  const [sigMetodoAutenticacao, setSigMetodoAutenticacao] = useState("email");
  const [sigConteudoDocumento, setSigConteudoDocumento] = useState("");
  const [sigFileName, setSigFileName] = useState("");
  
  const [loadingClicsign, setLoadingClicsign] = useState(false);
  const [sucessoClicsign, setSucessoClicsign] = useState("");
  const [erroClicsign, setErroClicsign] = useState("");
  
  const [envelopesEnviados, setEnvelopesEnviados] = useState<Envelope[]>([]);

  function handleSigFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSigFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSigConteudoDocumento(ev.target?.result as string);
    };
    reader.readAsText(file);
  }

  async function enviarAssinaturaClicSign() {
    setLoadingClicsign(true);
    setSucessoClicsign("");
    setErroClicsign("");
    try {
      const res = await fetch("/api/clicsign/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeDocumento: sigNomeDocumento,
          nomeSignatario: sigNomeSignatario,
          emailSignatario: sigEmailSignatario,
          cpfSignatario: sigCpfSignatario,
          conteudoBase64: btoa(unescape(encodeURIComponent(sigConteudoDocumento))),
          authMethod: sigMetodoAutenticacao,
        }),
      });
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setSucessoClicsign(`Envelope enviado! ID: ${data.documentId.substring(0, 8)}...`);
        setEnvelopesEnviados((prev) => [
          {
            id: data.documentId,
            docName: sigNomeDocumento || "Documento Sem Nome",
            signerName: sigNomeSignatario,
            signerEmail: sigEmailSignatario,
            auth: sigMetodoAutenticacao,
            date: new Date().toLocaleDateString("pt-BR"),
            status: "Aguardando Assinatura",
          },
          ...prev,
        ]);
        setSigConteudoDocumento("");
      } else {
        setErroClicsign(data.error || "Falha ao enviar para ClicSign.");
      }
    } catch {
      setErroClicsign("Erro de conexão.");
    } finally {
      setLoadingClicsign(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-emerald-950 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          <FileSignature className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Assinatura Eletrônica (Integração ClicSign)</h2>
          <p className="text-emerald-200 text-sm">Envie contratos e procurações para assinatura com validade jurídica (ICP-Brasil).</p>
        </div>
        <a href="/dashboard/configuracoes" className="ml-auto text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl px-3 py-2">
          ⚙️ Configurar Token ClicSign
        </a>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileSignature className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-900 text-base">Novo Envelope de Assinatura</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Nome do Signatário</label>
            <input type="text" className="input" placeholder="Ex: Maria da Silva" value={sigNomeSignatario} onChange={(e) => setSigNomeSignatario(e.target.value)} />
          </div>
          <div>
            <label className="label">E-mail do Signatário</label>
            <input type="email" className="input" placeholder="maria@email.com" value={sigEmailSignatario} onChange={(e) => setSigEmailSignatario(e.target.value)} />
          </div>
          <div>
            <label className="label">CPF do Signatário (Opcional p/ E-mail)</label>
            <input type="text" className="input" placeholder="000.000.000-00" value={sigCpfSignatario} onChange={(e) => setSigCpfSignatario(e.target.value)} />
          </div>
          <div>
            <label className="label">Nome do Documento</label>
            <input type="text" className="input" placeholder="Ex: Contrato_Honorarios" value={sigNomeDocumento} onChange={(e) => setSigNomeDocumento(e.target.value)} />
          </div>
          <div>
            <label className="label">Nível de Autenticação</label>
            <select className="input" value={sigMetodoAutenticacao} onChange={(e) => setSigMetodoAutenticacao(e.target.value)}>
              <option value="icp_brasil">🔐 Selo ICP-Brasil (Certificado A1/A3)</option>
              <option value="email">✉️ Token por E-mail</option>
            </select>
          </div>
          <div>
            <label className="label">Upload do Contrato (.txt ou .docx)</label>
            <label className={`flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${sigFileName ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}>
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs">{sigFileName || "Clique para anexar"}</span>
              <input type="file" accept=".txt,.docx" className="hidden" onChange={handleSigFileUpload} />
            </label>
          </div>
        </div>

        <div>
          <label className="label">Conteúdo do Documento a Assinar</label>
          <textarea
            rows={6}
            className="input resize-y font-sans text-sm"
            placeholder="Cole ou digite aqui o texto completo do contrato..."
            value={sigConteudoDocumento}
            onChange={(e) => setSigConteudoDocumento(e.target.value)}
          />
        </div>

        <button
          onClick={enviarAssinaturaClicSign}
          disabled={loadingClicsign || !sigNomeSignatario || !sigEmailSignatario || !sigConteudoDocumento}
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full justify-center py-4"
        >
          {loadingClicsign ? "Conectando à ClicSign..." : "Disparar Envelope por E-mail (ClicSign)"}
        </button>

        {sucessoClicsign && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
            {sucessoClicsign}
          </div>
        )}
        {erroClicsign && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Erro</p>
              <p className="text-sm">{erroClicsign}</p>
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Documentos em Assinatura</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 uppercase font-bold text-slate-500">
              <tr>
                <th className="p-3">Documento</th>
                <th className="p-3">Signatário</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Autenticação</th>
                <th className="p-3">Data</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {envelopesEnviados.map((item: Envelope) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold">{item.docName}</td>
                  <td className="p-3">{item.signerName}</td>
                  <td className="p-3">{item.signerEmail}</td>
                  <td className="p-3">{item.auth === "icp_brasil" ? "🔐 ICP-Brasil" : "✉️ E-mail"}</td>
                  <td className="p-3">{item.date}</td>
                  <td className="p-3 font-bold text-amber-600">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
