"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scale,
  Bell,
  Zap,
  Shield,
  ChevronRight,
  Search,
  FileText,
  Brain,
  TrendingUp,
  Check,
  Star,
  ArrowRight,
  Gavel,
  Clock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Busca Processual Inteligente",
    desc: "Consulte qualquer processo do DataJud (CNJ) pelo número CNJ em segundos. Suporte a todos os tribunais brasileiros.",
    color: "bg-blue-500",
  },
  {
    icon: Bell,
    title: "Alertas em Tempo Real",
    desc: "Receba notificações por email quando seu processo tiver nova movimentação. Nunca perca um prazo importante.",
    color: "bg-amber-500",
  },
  {
    icon: Brain,
    title: "IA que Entende Decisões",
    desc: "Nossa IA resume sentenças, acórdãos e despachos em linguagem clara e objetiva. Economia de horas de leitura.",
    color: "bg-green-500",
  },
  {
    icon: FileText,
    title: "Timeline Completa",
    desc: "Visualize toda a história do processo em uma linha do tempo organizada, do ajuizamento à sentença.",
    color: "bg-purple-500",
  },
  {
    icon: Shield,
    title: "Dados Oficiais do CNJ",
    desc: "Integração direta com o DataJud — a base oficial do Conselho Nacional de Justiça. Dados confiáveis e atualizados.",
    color: "bg-red-500",
  },
  {
    icon: TrendingUp,
    title: "Dashboard Gerencial",
    desc: "Visão geral de toda sua carteira de processos com métricas, status e alertas num único painel.",
    color: "bg-teal-500",
  },
];

const planos = [
  {
    nome: "Starter",
    preco: "R$ 97",
    periodo: "/mês",
    desc: "Para advogados autônomos",
    processos: "50 processos",
    ia: "30 resumos com IA/mês",
    color: "border-border",
    btn: "btn-outline",
    features: [
      "50 processos monitorados",
      "Alertas por email",
      "30 resumos com IA por mês",
      "Todos os tribunais do Brasil",
      "Suporte por email",
    ],
  },
  {
    nome: "Professional",
    preco: "R$ 197",
    periodo: "/mês",
    desc: "Para advogados ativos",
    processos: "200 processos",
    ia: "IA ilimitada",
    color: "border-accent",
    btn: "btn-accent",
    popular: true,
    features: [
      "200 processos monitorados",
      "Alertas por email e WhatsApp",
      "IA ilimitada para resumos",
      "Todos os tribunais do Brasil",
      "Exportação de relatórios PDF",
      "Suporte prioritário",
    ],
  },
  {
    nome: "Escritório",
    preco: "R$ 397",
    periodo: "/mês",
    desc: "Para escritórios e bancas",
    processos: "Ilimitado",
    ia: "IA ilimitada + relatórios",
    color: "border-primary",
    btn: "btn-primary",
    features: [
      "Processos ilimitados",
      "Multi-usuário (até 10 advogados)",
      "IA ilimitada para resumos",
      "Relatórios personalizados",
      "API de integração",
      "Gerente de conta dedicado",
    ],
  },
];

const depoimentos = [
  {
    nome: "Dr. Rafael Mendes",
    cargo: "Advogado Trabalhista — São Paulo",
    texto: "Reduzi em 80% o tempo que gastava acompanhando processos. A IA resume as decisões de forma clara e objetiva.",
    stars: 5,
  },
  {
    nome: "Dra. Carla Ferreira",
    cargo: "Advogada Cível — Rio de Janeiro",
    texto: "Os alertas em tempo real me salvaram de perder prazos importantes. Agora durmo tranquila sabendo que serei avisada.",
    stars: 5,
  },
  {
    nome: "Dr. Paulo Andrade",
    cargo: "Sócio — Andrade & Associados",
    texto: "Nossa banca tem 200+ processos. O LexAI centralizou tudo e nossa equipe ganhou horas de produtividade por semana.",
    stars: 5,
  },
];

const stats = [
  { valor: "1.3M+", label: "Advogados no Brasil" },
  { valor: "100M+", label: "Processos no DataJud" },
  { valor: "80%", label: "Redução de tempo manual" },
  { valor: "14 dias", label: "Teste grátis" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-primary">LexAI</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="nav-link">Funcionalidades</a>
              <a href="#planos" className="nav-link">Planos</a>
              <a href="#depoimentos" className="nav-link">Depoimentos</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="nav-link">Entrar</Link>
              <Link href="/auth/signup" className="btn-accent text-sm py-2 px-4">
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-gradient pt-32 pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-white/80 text-xs font-medium">
                Integração oficial com o DataJud / CNJ
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              O Assistente Jurídico<br />
              <span className="gold-text">que trabalha por você</span>
            </h1>

            <p className="text-white/70 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Monitore processos automaticamente, receba alertas em tempo real e
              deixe a IA resumir as decisões. Foco no que realmente importa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="btn-accent text-base py-4 px-8 shadow-glow">
                Começar 14 dias grátis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#demo" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:text-white text-base py-4 px-8">
                Ver demonstração
              </Link>
            </div>

            <p className="text-white/40 text-sm mt-4">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-accent">{stat.valor}</div>
                <div className="text-white/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="#F8F9FC" />
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="badge badge-primary mb-4">
                <Gavel className="w-3 h-3" /> Funcionalidades
              </div>
              <h2 className="section-title">Tudo que um advogado precisa</h2>
              <p className="section-subtitle max-w-2xl mx-auto">
                Da busca processual ao resumo com IA, centralizamos toda a inteligência jurídica que você precisa.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card group"
              >
                <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-primary/3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Como funciona</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Em 3 passos simples, sua carteira de processos fica monitorada 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", icon: Search, title: "Adicione seus processos", desc: "Informe o número CNJ do processo. Nossa plataforma busca automaticamente no DataJud." },
              { step: "02", icon: Bell, title: "Receba alertas automáticos", desc: "Quando houver nova movimentação, você recebe um email imediatamente com o que mudou." },
              { step: "03", icon: Brain, title: "IA interpreta por você", desc: "Clique em qualquer movimentação e nossa IA explica a decisão em linguagem simples e objetiva." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-premium">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="font-display text-5xl font-bold text-primary/8 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 select-none">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute right-0 top-8 text-accent w-6 h-6" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">O que dizem os advogados</h2>
            <p className="section-subtitle">Mais de 500 advogados já usam o LexAI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {depoimentos.map((dep, i) => (
              <motion.div
                key={dep.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: dep.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-4 italic">
                  &ldquo;{dep.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {dep.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{dep.nome}</div>
                    <div className="text-xs text-muted-foreground">{dep.cargo}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="py-24 bg-primary/3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Planos transparentes</h2>
            <p className="section-subtitle">Comece grátis por 14 dias. Sem cartão de crédito.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planos.map((plano, i) => (
              <motion.div
                key={plano.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative card-premium border-2 ${plano.color} ${plano.popular ? "scale-105 shadow-premium" : ""}`}
              >
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">{plano.nome}</h3>
                  <p className="text-muted-foreground text-sm">{plano.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-primary">{plano.preco}</span>
                  <span className="text-muted-foreground text-sm">{plano.periodo}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plano.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`${plano.btn} w-full justify-center`}>
                  Começar grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Todos os planos incluem 14 dias de teste gratuito · Cancele a qualquer momento
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="hero-gradient py-20 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Pare de perder tempo com processos
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Junte-se a mais de 500 advogados que já automatizaram o monitoramento processual com IA.
            </p>
            <Link href="/auth/signup" className="btn-accent text-base py-4 px-10 shadow-glow">
              Começar 14 dias grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-white/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">LexAI</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
            <p className="text-sm">© 2026 LexAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
