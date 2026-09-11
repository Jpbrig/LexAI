"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Scale, Mail, Eye, EyeOff, ArrowRight, Loader2, User, CheckCircle, AlertCircle } from "lucide-react";

const beneficios = [
  "14 dias grátis, sem cartão",
  "Todos os tribunais do Brasil (DataJud)",
  "IA para resumir decisões",
  "Cancele quando quiser",
];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oab, setOab] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, oab }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Não foi possível criar sua conta.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setError("Conta criada. Não foi possível iniciar sua sessão; faça login.");
      }
    } catch {
      setError("Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left — Brand */}
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
            Comece com o pé direito.<br />
            <span className="text-amber-400">Sem complicação.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
            Experimente o LexAI por 14 dias e veja como ele pode deixar seu escritório mais leve, organizado e eficiente.
          </p>

          <div className="space-y-3">
            {beneficios.map((b) => (
              <div key={b} className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-semibold">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-white text-xs font-bold">Dr. Rafael Mendes</p>
              <p className="text-slate-400 text-[11px]">Advogado Trabalhista · SP</p>
            </div>
          </div>
          <p className="text-slate-300 text-xs italic leading-relaxed">
            &ldquo;Economizo 2 horas por dia que antes gastava acompanhando processos manualmente.&rdquo;
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-xl space-y-5"
        >
          <div className="flex items-center gap-2 mb-2 lg:hidden">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-display text-xl font-bold text-slate-900">LexAI</span>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Criar conta grátis</h1>
            <p className="text-slate-500 text-xs mt-1">
              Já tem conta?{" "}
              <Link href="/auth/signin" className="text-amber-600 font-bold hover:underline">
                Entrar
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Crie sua conta com um e-mail profissional e escolha uma senha segura para começar.
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">ou preencha os dados</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Dr(a). Seu Nome"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email profissional</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="dr@escritorio.com.br"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número OAB <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="SP 123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                value={oab}
                onChange={(e) => setOab(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
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
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-4">
            Ao criar uma conta você concorda com os{" "}
            <a href="#" className="hover:underline text-slate-600">Termos de Uso</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
