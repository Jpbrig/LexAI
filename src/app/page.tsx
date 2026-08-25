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
  Calculator,
  Globe,
  Sparkles,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Busca Processual Oficial (DataJud)",
    desc: "Consulte qualquer processo no DataJud (CNJ) pelo número CNJ em segundos. Cobertura completa de todos os tribunais do Brasil.",
    color: "bg-slate-900 text-amber-400",
  },
  {
    icon: Brain,
    title: "Resumo Inteligente com IA",
    desc: "Nossa IA analisa sentenças, acórdãos e despachos extensos e traduz a decisão em linguagem objetiva indicando o próximo passo.",
    color: "bg-amber-500 text-white",
  },
  {
    icon: Calculator,
    title: "Cálculos Trabalhistas Instantâneos",
    desc: "Simule rescisões contratuais (CLT) com férias, 13º, aviso prévio e multa de 40% do FGTS em menos de 10 segundos.",
    color: "bg-slate-900 text-amber-400",
  },
  {
    icon: FileText,
    title: "Gerador de Procuração Ad Judicia",
    desc: "Gere e imprima procurações e declarações preenchidas automaticamente no padrão A4 oficial prontas para assinatura do cliente.",
    color: "bg-amber-500 text-white",
  },
  {
    icon: Bell,
    title: "Alertas Automáticos",
    desc: "Notificações por email sempre que houver qualquer nova publicação ou movimentação relevante na sua carteira.",
    color: "bg-slate-900 text-amber-400",
  },
  {
    icon: Lock,
    title: "Segurança de Acesso Avançada",
    desc: "Proteção contra acesso não autorizado com bloqueio automático temporário após 3 tentativas de login incorretas.",
    color: "bg-amber-500 text-white",
  },
];

const planos = [
  {
    nome: "Starter",
    preco: "R$ 97",
    periodo: "/mês",
    desc: "Para advogados autônomos",
    features: [
      "50 processos monitorados",
      "Todos os tribunais do Brasil (DataJud)",
      "Alertas por email",
      "Calculadora trabalhista ilimitada",
      "Gerador de procurações PDF",
      "30 resumos com IA por mês",
    ],
    btn: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  {
    nome: "Professional",
    preco: "R$ 197",
    periodo: "/mês",
    desc: "Para advogados ativos",
    popular: true,
    features: [
      "200 processos monitorados",
      "Todos os tribunais do Brasil (DataJud)",
      "Alertas por email e WhatsApp",
      "IA ilimitada para resumos",
      "Calculadora trabalhista ilimitada",
      "Gerador de procurações ilimitado",
      "Suporte prioritário",
    ],
    btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20",
  },
  {
    nome: "Escritório",
    preco: "R$ 397",
    periodo: "/mês",
    desc: "Para bancas e escritórios",
    features: [
      "Processos ilimitados",
      "Multi-usuário (até 10 advogados)",
      "IA ilimitada para resumos",
      "Calculadora trabalhista ilimitada",
      "Relatórios personalizados",
      "Gerente de conta dedicado",
    ],
    btn: "bg-slate-900 hover:bg-slate-800 text-white",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-500 selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <span className="font-display text-xl font-bold text-slate-900 tracking-tight">
                Lex<span className="text-amber-500">AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
              <a href="#features" className="hover:text-slate-900 transition-colors">Funcionalidades</a>
              <a href="#ferramentas" className="hover:text-slate-900 transition-colors">Ferramentas</a>
              <a href="#planos" className="hover:text-slate-900 transition-colors">Planos</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2">
                Entrar
              </Link>
              <Link href="/auth/signup" className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95">
                Testar 14 Dias Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 text-xs font-semibold">
                Plataforma de Inteligência Jurídica Integrada ao DataJud / CNJ
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
              O Ecossistema de IA<br />
              <span className="text-amber-400">que transforma sua advocacia</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              Acompanhe processos em tempo real, interprete sentenças com Inteligência Artificial, calcule verbas trabalhistas e gere procurações em segundos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                Começar 14 dias grátis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/signin" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all">
                Acessar Conta de Teste
              </Link>
            </div>

            <p className="text-slate-500 text-xs mt-4">
              Sem necessidade de cartão de crédito · Teste completo por 14 dias
            </p>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3.5 py-1.5 rounded-full">
            Recursos do LexAI
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-4 tracking-tight">
            Tudo que seu escritório precisa em um só lugar
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Desenvolvido sob medida para advogados e escritórios brasileiros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{feat.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="py-24 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Planos transparentes e acessíveis</h2>
            <p className="text-slate-500 text-sm mt-2">Escolha o plano ideal para a escala da sua advocacia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planos.map((plano, i) => (
              <div
                key={plano.nome}
                className={`bg-white rounded-3xl p-8 border ${plano.popular ? "border-amber-500 ring-2 ring-amber-500/20 shadow-xl" : "border-slate-200/80 shadow-sm"} relative flex flex-col justify-between`}
              >
                {plano.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Mais Popular
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">{plano.nome}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{plano.desc}</p>

                  <div className="my-6">
                    <span className="font-display text-4xl font-bold text-slate-900">{plano.preco}</span>
                    <span className="text-slate-400 text-xs">{plano.periodo}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plano.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth/signup"
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold text-center block transition-all active:scale-95 ${plano.btn}`}
                >
                  Começar 14 dias grátis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-display text-base font-bold text-white">LexAI</span>
          </div>
          <p>© 2026 LexAI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
