"use client";

import { useState } from "react";
import { Bot, VolumeX, Volume2, AlertCircle, MicOff, Mic, Sparkles, X } from "lucide-react";

type ChatMsg = { role: "user" | "assistant"; text: string };

export default function TabAssistente() {
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { role: "assistant", text: "Olá! Sou seu Assistente Jurídico IA, especializado em direito brasileiro. Posso ajudar com pesquisa de jurisprudência, fundamentação legal, análise de casos, doutrina e mais. Como posso te ajudar?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [micError, setMicError] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<{ stop: () => void } | null>(null);

  async function enviarMensagem() {
    if (!chatInput.trim() || loadingChat) return;
    
    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoadingChat(true);

    try {
      const res = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: chatMessages.slice(-5) }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", text: "Desculpe, ocorreu um erro na comunicação com a IA." }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", text: "Erro de conexão com o servidor." }]);
    } finally {
      setLoadingChat(false);
    }
  }

  function lerMensagemVoz(texto: string, idx: number) {
    if (speakingIndex === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(idx);
    window.speechSynthesis.speak(utterance);
  }

  function openVoiceModal() {
    setShowVoiceModal(true);
    setMicError("");
    requestMicPermissionAndStart();
  }

  function closeVoiceModal() {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch {}
    }
    setIsListening(false);
    setShowVoiceModal(false);
  }

  function requestMicPermissionAndStart() {
    setMicError("");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
          startSpeechRecognition();
        })
        .catch(() => {
          setIsListening(false);
          setMicError("Permissão negada. Ative o microfone no cadeado da URL.");
        });
    } else {
      startSpeechRecognition();
    }
  }

  function startSpeechRecognition() {
    const win = window as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SpeechRecognition?: new () => any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webkitSpeechRecognition?: new () => any;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setMicError("Seu navegador não suporta voz (use Chrome ou Edge).");
      return;
    }
    try {
      const recognition = new SpeechRec();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => { setIsListening(true); setMicError(""); };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: { error: string }) => setMicError(e.error === "not-allowed" ? "Microfone bloqueado" : `Erro: ${e.error}`);
      recognition.onresult = (e: { resultIndex: number, results: { transcript: string }[][] }) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          transcript += e.results[i][0].transcript;
        }
        setChatInput(transcript);
      };
      recognition.start();
      setRecognitionInstance(recognition);
    } catch (e) {
      setMicError("Erro ao iniciar gravador.");
      setIsListening(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <Bot className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">I.A. Assistente Jurídico</h2>
          <p className="text-slate-300 text-sm">Powered by Google Gemini — Pesquise jurisprudência, doutrina e fundamentos legais em tempo real.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          "Requisitos para aposentadoria por tempo de contribuição?",
          "O que diz o STJ sobre juros abusivos em contratos bancários?",
          "Direitos do consumidor em compra cancelada online?",
          "Como funciona a dosimetria da pena no Código Penal?",
        ].map((sugestao) => (
          <button
            key={sugestao}
            onClick={() => setChatInput(sugestao)}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all"
          >
            {sugestao}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden flex flex-col" style={{ height: "520px" }}>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${msg.role === "user" ? "bg-slate-900" : "bg-amber-500"}`}>
                {msg.role === "user" ? "EU" : "IA"}
              </div>
              <div className="relative group max-w-[80%]">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-sm"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm"
                }`}>
                  {msg.text}
                </div>

                {msg.role === "assistant" && (
                  <button
                    onClick={() => lerMensagemVoz(msg.text, i)}
                    className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                      speakingIndex === i ? "text-amber-600 font-bold animate-pulse" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {speakingIndex === i ? <VolumeX className="w-3.5 h-3.5 text-amber-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{speakingIndex === i ? "Lendo resposta..." : "Ouvir áudio"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {loadingChat && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">IA</div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="flex gap-2 items-end">
            <textarea
              rows={2}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm resize-none outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Faça uma pergunta jurídica... (Enter para enviar)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarMensagem();
                }
              }}
            />
            <button
              onClick={openVoiceModal}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 shadow-md animate-pulse ring-2 ring-rose-300"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-500" />}
            </button>
            <button
              onClick={enviarMensagem}
              disabled={loadingChat || !chatInput.trim()}
              className="btn-primary px-5 py-3.5 self-end disabled:opacity-50"
            >
              {loadingChat ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
            </button>
          </div>
        </div>
      </div>

      {showVoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold">Ditado por Voz para IA</h3>
              <button onClick={closeVoiceModal} className="w-8 h-8 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 text-center space-y-5">
              <div className="flex justify-center my-2">
                <button
                  onClick={requestMicPermissionAndStart}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isListening ? "bg-rose-500 text-white animate-pulse" : "bg-amber-500 text-slate-900"
                  }`}
                >
                  <Mic className="w-10 h-10" />
                </button>
              </div>
              <p className="font-bold text-slate-900">{isListening ? "🎙️ Ouvindo..." : "Toque no microfone"}</p>
              {micError && <p className="text-amber-800 text-sm">{micError}</p>}
              <textarea
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-medium resize-none"
                placeholder="Transcrição..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button onClick={closeVoiceModal} className="btn-outline text-xs py-2 px-4">Fechar</button>
                <button onClick={() => { closeVoiceModal(); enviarMensagem(); }} disabled={!chatInput.trim()} className="btn-primary text-xs py-2 px-5">
                  Enviar para IA 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
