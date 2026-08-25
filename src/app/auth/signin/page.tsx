"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Mail, Eye, EyeOff, ArrowRight, Globe, Loader2 } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
              <Scale className="w-5 h-5 text-accent" />
            </div>
            <span className="font-display text-2xl font-bold text-white">LexAI</span>
          </div>

          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Seu escritório.<br />
            <span className="gold-text">Mais inteligente.</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm">
            Monitore processos automaticamente e deixe a IA interpretar as decisões por você.
          </p>
        </div>

        {/* Decorative stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { value: "1.940+", label: "Advogados ativos" },
            { value: "80%", label: "Menos tempo manual" },
            { value: "100%", label: "Dados do CNJ" },
            { value: "14 dias", label: "Teste grátis" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="font-display text-2xl font-bold text-accent">{s.value}</div>
              <div className="text-white/50 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-primary">LexAI</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-primary mb-1">Bem-vindo de volta</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Não tem conta?{" "}
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>

          {/* Google OAuth */}
          <button className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-primary/2 transition-all duration-200 mb-6">
            <Globe className="w-5 h-5 text-blue-500" />
            Entrar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">ou entre com email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="seu@email.com.br"
                  className="input pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Senha</label>
                <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full justify-center py-3 mt-2 text-base"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao entrar, você concorda com nossos{" "}
            <a href="#" className="hover:underline">Termos de Uso</a> e{" "}
            <a href="#" className="hover:underline">Política de Privacidade</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
