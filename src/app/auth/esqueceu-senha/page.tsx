"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Mail, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setError("Não foi possível processar a solicitação. Tente novamente.");
        return;
      }

      setSent(true);
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Recuperar senha</h1>
          <p className="text-slate-500 text-xs mt-1">
            Digite seu e-mail e enviaremos um link seguro para redefinir sua senha.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              Verifique seu e-mail
            </div>
            <p className="text-xs leading-relaxed text-emerald-700">
              Se existir uma conta com este endereço, enviaremos as instruções de recuperação. Verifique também a pasta de spam.
            </p>
            <Link href="/auth/signin" className="inline-block text-xs font-bold text-slate-900 hover:underline pt-2">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label htmlFor="recovery-email" className="block text-xs font-bold text-slate-700 mb-1.5">E-mail cadastrado</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="seu@email.com.br"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Enviando..." : "Enviar instruções"}
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/signin" className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                Lembrou a senha? Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
