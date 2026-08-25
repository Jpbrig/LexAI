"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Scale, Zap, Building, Star } from "lucide-react";

const planos = [
  {
    id: "starter",
    nome: "Starter",
    preco: 97,
    periodo: "mês",
    desc: "Para advogados autônomos",
    icon: Scale,
    color: "border-border",
    btnClass: "btn-outline",
    features: [
      "50 processos monitorados",
      "Todos os tribunais do Brasil",
      "Alertas por email",
      "30 resumos com IA/mês",
      "Dashboard completo",
      "Suporte por email",
    ],
    notIncluded: ["Alertas por WhatsApp", "Exportação PDF", "Multi-usuário", "API de integração"],
  },
  {
    id: "professional",
    nome: "Professional",
    preco: 197,
    periodo: "mês",
    desc: "Para advogados ativos",
    icon: Zap,
    popular: true,
    color: "border-accent ring-2 ring-accent/20",
    btnClass: "btn-accent",
    features: [
      "200 processos monitorados",
      "Todos os tribunais do Brasil",
      "Alertas por email e WhatsApp",
      "IA ilimitada para resumos",
      "Exportação de relatórios PDF",
      "Dashboard avançado com métricas",
      "Suporte prioritário (resposta em 4h)",
    ],
    notIncluded: ["Multi-usuário", "API de integração"],
  },
  {
    id: "escritorio",
    nome: "Escritório",
    preco: 397,
    periodo: "mês",
    desc: "Para escritórios e bancas",
    icon: Building,
    color: "border-primary",
    btnClass: "btn-primary",
    features: [
      "Processos ilimitados",
      "Todos os tribunais do Brasil",
      "Alertas por email e WhatsApp",
      "IA ilimitada para resumos",
      "Relatórios personalizados",
      "Multi-usuário (até 10 advogados)",
      "API de integração",
      "Gerente de conta dedicado",
      "Treinamento da equipe",
    ],
    notIncluded: [],
  },
];

const faq = [
  {
    q: "Preciso de cartão de crédito para testar?",
    a: "Não! Os 14 dias de teste são completamente gratuitos e sem necessidade de cartão. Você só paga se decidir continuar.",
  },
  {
    q: "Quais tribunais são suportados?",
    a: "Todos os tribunais integrados ao DataJud (CNJ): TJSP, TJRJ, TJMG, TRF1 ao TRF6, todos os TRTs, STJ, STF, TST, TSE e mais 40+ tribunais.",
  },
  {
    q: "Como funciona o resumo com IA?",
    a: "Nossa IA analisa o texto completo de decisões, despachos e acórdãos e gera um resumo em linguagem clara, indicando o impacto para o seu cliente.",
  },
  {
    q: "Posso mudar de plano a qualquer momento?",
    a: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor é ajustado proporcionalmente.",
  },
  {
    q: "Os dados são seguros?",
    a: "Sim. Usamos criptografia em trânsito e em repouso. Todos os dados processuais já são públicos via DataJud/CNJ. Nunca compartilhamos seus dados com terceiros.",
  },
];

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-primary">LexAI</span>
          </Link>
          <Link href="/auth/signin" className="btn-outline text-sm py-2">Entrar</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="badge badge-primary mx-auto mb-4">
            <Star className="w-3 h-3" /> Planos e Preços
          </div>
          <h1 className="section-title">Investimento que se paga no primeiro caso</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            Comece grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {planos.map((plano, i) => (
            <motion.div
              key={plano.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative card-premium border-2 ${plano.color} ${plano.popular ? "scale-105" : ""}`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plano.popular ? "bg-accent" : "bg-primary"}`}>
                  <plano.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">{plano.nome}</h3>
                  <p className="text-xs text-muted-foreground">{plano.desc}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-primary">R$ {plano.preco}</span>
                  <span className="text-muted-foreground text-sm">/{plano.periodo}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Cobrado mensalmente · Cancele quando quiser</p>
              </div>

              <Link href="/auth/signup" className={`${plano.btnClass} w-full justify-center mb-6`}>
                Começar 14 dias grátis
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-2.5">
                {plano.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{f}</span>
                  </div>
                ))}
                {plano.notIncluded?.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center">
                      <div className="w-3 h-px bg-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground line-through">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-display text-3xl font-bold text-primary text-center mb-10">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div key={i} className="card">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">Ainda tem dúvidas? Fale com nosso time.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/signup" className="btn-accent text-base py-3 px-8">
              Começar 14 dias grátis <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:contato@lexai.com.br" className="btn-outline text-base py-3 px-8">
              Falar com o time
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
