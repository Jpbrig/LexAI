"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Scale, Mail, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ShieldAlert } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setError(
        result?.error === "account-locked"
          ? "Conta temporariamente bloqueada. Tente novamente mais tarde."
          : "E-mail ou senha inválidos.",
      );
    } catch {
      setError("Não foi possível concluir o login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Scale className="w-6 h-6 text-amber-400" />
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              Lex<span className="text-amber-400">AI</span>
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Seu escritório.<br />
            <span className="text-amber-400">Mais organizado.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Acompanhe processos, priorize tarefas e deixe a IA ajudar com clareza, rapidez e menos atrito no dia a dia.
          </p>
        </div>

        {/* Security note — credentials are never exposed in the UI. */}
        <div className="relative z-10 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Acesso seguro</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Sua sessão é protegida por cookie seguro e políticas contra tentativas repetidas de acesso.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xl space-y-6"
        >
          {/* Mobile Header */}
          <div className="flex items-center gap-2 mb-2 lg:hidden">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-display text-xl font-bold text-slate-900">LexAI</span>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Que bom ver você de novo</h1>
            <p className="text-slate-500 text-xs mt-1">
              Ainda não tem conta?{" "}
              <Link href="/auth/signup" className="text-amber-600 font-bold hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Entre com seu e-mail e senha para acessar o seu espaço no LexAI.
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">ou entre com email</span>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 mb-0">Senha</label>
                <Link href="/auth/esqueceu-senha" className="text-xs text-amber-600 font-semibold hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Autenticando..." : "Entrar no LexAI"}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-4">
            Ao entrar, você concorda com nossos{" "}
            <a href="#" className="hover:underline text-slate-600">Termos de Uso</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
