"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Scale, ArrowRight, Loader2, CheckCircle, AlertCircle, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Este link de recuperação não é válido.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Não foi possível redefinir a senha.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.replace("/auth/signin"), 1800);
    } catch {
      setError("Não foi possível conectar ao servidor.");
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

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Senha redefinida
            </div>
            <p className="text-xs text-emerald-700">Suas sessões anteriores foram encerradas. Redirecionando para o login.</p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Criar nova senha</h1>
              <p className="text-slate-500 text-xs mt-1">Use pelo menos 8 caracteres e não reutilize uma senha comprometida.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="new-password" className="block text-xs font-bold text-slate-700 mb-1.5">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                  <input
                    id="new-password"
                    type="password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-700 mb-1.5">Confirmar senha</label>
                <input
                  id="confirm-password"
                  type="password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>

            <Link href="/auth/signin" className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-900">
              Voltar ao login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
