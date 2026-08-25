"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl space-y-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-display text-xl font-bold text-slate-900">LexAI</span>
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Recuperar Senha</h1>
          <p className="text-slate-500 text-xs mt-1">
            Digite seu email e enviaremos um link seguro para redefinir sua senha.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              Link Enviado com Sucesso!
            </div>
            <p className="text-xs leading-relaxed text-emerald-700">
              Enviamos as instruções de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spams.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block text-xs font-bold text-slate-900 hover:underline pt-2"
            >
              ← Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Cadastrado</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="seu@email.com.br"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Enviando..." : "Enviar Instruções de Recuperação"}
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/signin" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                Lembrou a senha? Voltar ao Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
