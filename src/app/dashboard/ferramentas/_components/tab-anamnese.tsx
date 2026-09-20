"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  Mic,
  MicOff,
  UploadCloud,
  FileCheck2,
  Sparkles,
  Loader2,
  Plus,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Send,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import type { AnamneseCasoItem, ClienteApiItem } from "@/lib/types";

type ModoEntrada = "texto" | "microfone" | "audio" | "documento";

interface SpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

type DiagnosticoResultado = {
  tesePrincipal?: string;
  fundamentacaoLegal?: string[];
  probabilidadeExito?: "Alta" | "Média" | "Baixa" | string;
  analiseRiscoPrescricao?: string;
  provasFaltantes?: string[];
  esbocoPeticaoInicial?: string;
};

export default function TabAnamnese() {
  const [modo, setModo] = useState<ModoEntrada>("texto");

  // Campos do formulário
  const [tituloCaso, setTituloCaso] = useState("");
  const [areaDireito, setAreaDireito] = useState("CIVEL");
  const [relatoFatos, setRelatoFatos] = useState("");
  const [pedidosPretendidos, setPedidosPretendidos] = useState("");
  const [provasDisponiveis, setProvasDisponiveis] = useState("");
  const [clienteId, setClienteId] = useState<string>("");

  // Estados de Clientes e Anamneses Salvas
  const [clientes, setClientes] = useState<ClienteApiItem[]>([]);
  const [anamnesesSalvas, setAnamnesesSalvas] = useState<AnamneseCasoItem[]>([]);
  const [loadingSalvas, setLoadingSalvas] = useState(true);

  // Estado de Gravação do Microfone (Web Speech API + MediaRecorder)
  const [gravando, setGravando] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Estados de IA e Arquivos
  const [uploading, setUploading] = useState(false);
  const [diagnosticando, setDiagnosticando] = useState(false);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoResultado | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erro, setErro] = useState("");

  const carregarDadosIniciais = useCallback(async () => {
    try {
      const [resCli, resAna] = await Promise.all([
        fetch("/api/clientes"),
        fetch("/api/anamnese"),
      ]);

      if (resCli.ok) {
        const dataCli = (await resCli.json()) as ClienteApiItem[];
        if (Array.isArray(dataCli)) setClientes(dataCli);
      }
      if (resAna.ok) {
        const dataAna = (await resAna.json()) as AnamneseCasoItem[];
        if (Array.isArray(dataAna)) setAnamnesesSalvas(dataAna);
      }
    } catch (e) {
      console.error("Erro ao carregar anamneses/clientes:", e);
    } finally {
      setLoadingSalvas(false);
    }
  }, []);

  useEffect(() => {
    void carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  // Alternar gravação de voz com transcrição em tempo real
  function toggleGravacaoVoz() {
    if (gravando) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setGravando(false);
      return;
    }

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };

    const SpeechRec = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRec) {
      setErro("Seu navegador não suporta reconhecimento de voz em tempo real. Utilize o upload de áudio.");
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "pt-BR";

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res?.[0]) transcript += res[0].transcript + " ";
        }
        setRelatoFatos((prev) => (prev ? `${prev}\n${transcript.trim()}` : transcript.trim()));
      };

      rec.onerror = () => {
        setGravando(false);
      };

      rec.onend = () => {
        setGravando(false);
      };

      rec.start();
      recognitionRef.current = rec;
      setGravando(true);
      setErro("");
    } catch {
      setErro("Erro ao iniciar o microfone. Verifique a permissão no navegador.");
      setGravando(false);
    }
  }

  // Upload e Transcrição Multimodal de Arquivo (Áudio ou Documento)
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErro("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/anamnese/transcrever", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as { transcricao?: string; error?: string };

      if (!res.ok || data.error) {
        throw new Error(data.error || "Falha na transcrição do arquivo.");
      }

      if (data.transcricao) {
        setRelatoFatos((prev) => (prev ? `${prev}\n\n[Transcrição de ${file.name}]:\n${data.transcricao}` : data.transcricao ?? ""));
        setMensagemSucesso(`Arquivo "${file.name}" processado e transcrito com sucesso!`);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao transcrever arquivo.");
    } finally {
      setUploading(false);
    }
  }

  // Gerar Diagnóstico Inteligente com IA (Skill legal-petition-ai)
  async function handleGerarDiagnostico(e: React.FormEvent) {
    e.preventDefault();
    if (!tituloCaso || !relatoFatos) {
      setErro("Preencha ao menos o título do caso e o relato dos fatos.");
      return;
    }

    setDiagnosticando(true);
    setErro("");
    setDiagnostico(null);

    try {
      const res = await fetch("/api/anamnese/diagnosticar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tituloCaso,
          areaDireito,
          relatoFatos,
          pedidosPretendidos,
          provasDisponiveis,
        }),
      });

      const payload = (await res.json()) as { diagnostico?: DiagnosticoResultado; error?: string };

      if (!res.ok || payload.error) {
        throw new Error(payload.error || "Erro ao gerar diagnóstico.");
      }

      if (payload.diagnostico) {
        setDiagnostico(payload.diagnostico);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao gerar diagnóstico com IA.");
    } finally {
      setDiagnosticando(false);
    }
  }

  // Salvar Ficha de Anamnese no Banco
  async function handleSalvarAnamnese() {
    if (!tituloCaso || !relatoFatos) return;

    try {
      const res = await fetch("/api/anamnese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tituloCaso,
          areaDireito,
          relatoFatos,
          pedidosPretendidos,
          provasDisponiveis,
          clienteId: clienteId || null,
          diagnosticoIa: diagnostico ? JSON.stringify(diagnostico) : null,
        }),
      });

      if (res.ok) {
        setMensagemSucesso("Ficha de Anamnese salva com sucesso!");
        void carregarDadosIniciais();
      }
    } catch (err) {
      console.error("Erro ao salvar anamnese:", err);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-amber-500" />
            Anamnese Jurídica &amp; Triagem de Casos IA
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Entrevista guiada de caso com ditado por voz, transcrição de áudio/documentos e pré-diagnóstico com IA.
          </p>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGerarDiagnostico} className="card space-y-5 shadow-sm">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Dados Iniciais da Triagem
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Título / Resumo do Caso</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Ação Indenizatória por Danos Morais — Cancelamento de Voo"
                  value={tituloCaso}
                  onChange={(e) => setTituloCaso(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Área do Direito</label>
                <select
                  className="input"
                  value={areaDireito}
                  onChange={(e) => setAreaDireito(e.target.value)}
                >
                  <option value="CIVEL">Direito Cível / Obrigações</option>
                  <option value="TRABALHISTA">Direito do Trabalho</option>
                  <option value="FAMILIA">Direito de Família &amp; Sucessões</option>
                  <option value="CONSUMIDOR">Direito do Consumidor</option>
                  <option value="PREVIDENCIARIO">Direito Previdenciário (INSS)</option>
                  <option value="PENAL">Direito Penal / Criminal</option>
                  <option value="EMPRESARIAL">Direito Empresarial</option>
                  <option value="TRIBUTARIO">Direito Tributário</option>
                  <option value="OUTROS">Outra Matéria</option>
                </select>
              </div>

              <div>
                <label className="label">Vincular a Cliente (Opcional)</label>
                <select
                  className="input"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">Nenhum (Triagem Avulsa)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.documento})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modos de Entrada do Relato */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="label flex items-center justify-between">
                <span>Relato dos Fatos (Fatos Narrados pelo Cliente)</span>
                <span className="text-[10px] text-slate-400 font-mono">Multimodal (Texto / Voz / Áudio / Doc)</span>
              </label>

              {/* Botões de Seleção de Modo */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setModo("texto")}
                  className={`btn-outline text-xs px-3 py-1.5 ${modo === "texto" ? "bg-slate-900 text-white border-slate-900" : ""}`}
                >
                  ✍️ Digitar Texto
                </button>
                <button
                  type="button"
                  onClick={toggleGravacaoVoz}
                  className={`btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5 ${
                    gravando ? "bg-rose-600 text-white border-rose-600 animate-pulse" : modo === "microfone" ? "bg-slate-900 text-white" : ""
                  }`}
                >
                  {gravando ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-500" />}
                  {gravando ? "Gravando (Clique p/ Parar)" : "🎙️ Ditado por Voz"}
                </button>
                <label className="btn-outline text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1">
                  🎵 Upload Áudio (MP3/WAV)
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                </label>
                <label className="btn-outline text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1">
                  📄 Upload Doc (PDF/TXT)
                  <input type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {uploading && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center gap-2 border border-amber-200">
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>A IA do Gemini está transcrevendo o arquivo enviado...</span>
                </div>
              )}

              <textarea
                rows={6}
                className="input text-xs leading-relaxed font-sans"
                placeholder="Descreva o que aconteceu de forma cronológica..."
                value={relatoFatos}
                onChange={(e) => setRelatoFatos(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Pedidos Pretendidos</label>
                <textarea
                  rows={3}
                  className="input text-xs"
                  placeholder="Ex: Restituição em dobro, Indenização por Danos Morais de R$ 10.000..."
                  value={pedidosPretendidos}
                  onChange={(e) => setPedidosPretendidos(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Provas Disponíveis</label>
                <textarea
                  rows={3}
                  className="input text-xs"
                  placeholder="Ex: Cartão de embarque, comprovante de pagamento, troca de e-mails..."
                  value={provasDisponiveis}
                  onChange={(e) => setProvasDisponiveis(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 justify-end">
              <button
                type="button"
                onClick={handleSalvarAnamnese}
                className="btn-outline text-xs py-2.5 px-4"
              >
                💾 Salvar Ficha Fatos
              </button>
              <button
                type="submit"
                disabled={diagnosticando}
                className="btn-primary text-xs py-2.5 px-5 shadow-md flex items-center gap-1.5"
              >
                {diagnosticando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Analisando com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>✨ Gerar Diagnóstico Jurídico com IA</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Lista de Anamneses Salvas */}
          <div className="card space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Anamneses Cadastradas ({anamnesesSalvas.length})
            </h3>

            {loadingSalvas ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : anamnesesSalvas.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {anamnesesSalvas.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setTituloCaso(item.tituloCaso);
                      setAreaDireito(item.areaDireito);
                      setRelatoFatos(item.relatoFatos);
                      setPedidosPretendidos(item.pedidosPretendidos || "");
                      setProvasDisponiveis(item.provasDisponiveis || "");
                      if (item.diagnosticoIa) {
                        try {
                          setDiagnostico(JSON.parse(item.diagnosticoIa));
                        } catch {
                          setDiagnostico({ tesePrincipal: item.diagnosticoIa });
                        }
                      }
                    }}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-400 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                        {item.areaDireito}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{item.tituloCaso}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.relatoFatos}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Nenhuma anamnese registrada no escritório.</p>
            )}
          </div>
        </div>

        {/* Painel do Diagnóstico por IA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card space-y-4 bg-slate-900 text-white shadow-xl min-h-[500px]">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-amber-400 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Parecer &amp; Diagnóstico IA
              </h2>
            </div>

            {diagnostico ? (
              <div className="space-y-4 text-xs leading-relaxed animate-fade-in">
                {/* Tese Principal */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="font-bold text-[10px] text-amber-400 uppercase tracking-wider">Tese Jurídica Recomendada</span>
                  <p className="text-slate-200">{diagnostico.tesePrincipal || "Análise concluída."}</p>
                </div>

                {/* Fundamentação Legal */}
                {diagnostico.fundamentacaoLegal && diagnostico.fundamentacaoLegal.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Dispositivos Legais Aplicáveis</span>
                    <div className="flex flex-wrap gap-1">
                      {diagnostico.fundamentacaoLegal.map((lei, idx) => (
                        <span key={idx} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded font-mono text-[11px]">
                          {lei}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Probabilidade de Êxito & Risco */}
                {diagnostico.analiseRiscoPrescricao && (
                  <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl space-y-1">
                    <span className="font-bold text-[10px] text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Análise de Riscos &amp; Prescrição
                    </span>
                    <p className="text-amber-200 text-[11px]">{diagnostico.analiseRiscoPrescricao}</p>
                  </div>
                )}

                {/* Provas Faltantes */}
                {diagnostico.provasFaltantes && diagnostico.provasFaltantes.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Documentos Recomendados para Solicitar ao Cliente</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {diagnostico.provasFaltantes.map((prova, idx) => (
                        <li key={idx}>{prova}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ações Rápidas: Gerar Petição & Notificar Cliente via WhatsApp */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const msgCliente = `Olá! Registramos o atendimento referente ao caso: "${tituloCaso}".\n\n📌 Parecer preliminar: ${diagnostico.tesePrincipal || "Análise em andamento."}\n\n📄 Documentos a providenciar: ${diagnostico.provasFaltantes?.join(", ") || "Conforme combinado."}\n\nQualquer dúvida, estamos à disposição no escritório!`;
                      navigator.clipboard.writeText(msgCliente);
                      setMensagemSucesso("Resumo simplificado copiado! Pronto para colar no WhatsApp do cliente.");
                    }}
                    className="btn-outline text-amber-300 border-amber-500/40 hover:bg-amber-500/10 w-full justify-center py-2.5 text-xs flex items-center gap-2"
                  >
                    <span>📱 Copiar Resumo para WhatsApp do Cliente</span>
                  </button>

                  <a
                    href={`/dashboard/ferramentas?tab=peticoes&requerente=${encodeURIComponent(tituloCaso)}&fatos=${encodeURIComponent(relatoFatos)}&pedidos=${encodeURIComponent(pedidosPretendidos || "")}`}
                    className="btn-accent w-full justify-center py-3 text-xs shadow-lg flex items-center gap-2"
                  >
                    <span>📄 Gerar Petição Inicial deste Caso</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-3">
                <Scale className="w-12 h-12 text-slate-700 stroke-1" />
                <p className="text-xs max-w-xs">
                  Preencha o relato dos fatos (por texto, microfone ou áudio) e clique em **"Gerar Diagnóstico Jurídico com IA"** para obter o parecer preliminar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
