"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Mail, Eye, EyeOff, ArrowRight, Globe, Loader2, User, CheckCircle } from "lucide-react";

const beneficios = [
  "14 dias grátis, sem cartão",
  "Todos os tribunais do Brasil",
  "IA para resumir decisões",
  "Cancele quando quiser",
];

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oab, setOab] = useState("");
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
      {/* Left — Brand */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/30">
              <Scale className="w-5 h-5 text-accent" />
            </div>
            <span className="font-display text-2xl font-bold text-white">LexAI</span>
          </div>

          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Comece grátis.<br />
            <span className="gold-text">Sem compromisso.</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm mb-10">
            14 dias de acesso completo para você ver como o LexAI transforma sua advocacia.
          </p>

          <div className="space-y-3">
            {beneficios.map((b) => (
              <div key={b} className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Dr. Rafael Mendes</p>
              <p className="text-white/50 text-xs">Advogado Trabalhista · SP</p>
            </div>
          </div>
          <p className="text-white/70 text-sm italic leading-relaxed">
            &ldquo;Economizo 2 horas por dia que antes gastava acompanhando processos manualmente.&rdquo;
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-primary">LexAI</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-primary mb-1">Criar conta grátis</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Já tem conta?{" "}
            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>

          <button className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-primary/2 transition-all duration-200 mb-6">
            <Globe className="w-5 h-5 text-blue-500" />
            Cadastrar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">ou preencha os dados</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Dr(a). Seu Nome"
                  className="input pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email profissional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="dr@escritorio.com.br"
                  className="input pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">
                Número OAB <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="SP 123456"
                className="input"
                value={oab}
                onChange={(e) => setOab(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
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
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao criar uma conta você concorda com os{" "}
            <a href="#" className="hover:underline">Termos de Uso</a> e a{" "}
            <a href="#" className="hover:underline">Política de Privacidade</a> do LexAI.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
