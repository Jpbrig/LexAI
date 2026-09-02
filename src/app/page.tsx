"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scale,
  Search,
  Brain,
  Check,
  ArrowRight,
  Clock,
  UserCheck,
  Sparkles,
  Zap,
  Building2,
  Lock,
  Globe,
  Bot,
  FileSignature,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "CRM & Fichas de Clientes (PF/PJ)",
    desc: "Gestão completa de clientes com histórico unificado de processos, prazos, procurações e documentos cadastrados.",
    color: "bg-amber-500 text-white",
  },
  {
    icon: Clock,
    title: "Agenda & Prazos em Dias Úteis",
    desc: "Calculadora automática de prazos processuais em dias úteis (CPC Art. 219 e CLT), sincronizada com audiências.",
    color: "bg-slate-900 text-amber-400",
  },
  {
    icon: Search,
    title: "DataJud / CNJ API Pública Oficial",
    desc: "Consulta processual direta na base pública oficial do CNJ para TJSP, TRF, TRT, STJ e STF com movimentações em tempo real.",
    color: "bg-amber-500 text-white",
  },
  {
    icon: Brain,
    title: "Petições & Assistente IA (Gemini)",
    desc: "Gere minutas de Iniciais, Contestações e Recursos fundamentados na legislação brasileira vigente em segundos.",
    color: "bg-slate-900 text-amber-400",
  },
  {
    icon: FileSignature,
    title: "Assinatura Eletrônica (ClicSign)",
    desc: "Envie procurações e contratos de honorários para assinatura digital com validade jurídica (ICP-Brasil).",
    color: "bg-amber-500 text-white",
  },
  {
    icon: Building2,
    title: "Consultas Gov em Tempo Real",
    desc: "Enriqueça cadastros consultando CEP (ViaCEP/Correios) e dados cadastrais de empresas (Receita Federal / CNPJ).",
    color: "bg-slate-900 text-amber-400",
  },
];

const integracoes = [
  { nome: "DataJud / CNJ", badge: "API Oficial Pública", desc: "Metadados e movimentações de todos os tribunais do Brasil", icon: Search },
  { nome: "Google Gemini 1.5", badge: "Inteligência Artificial", desc: "Elaboração de peças jurídicas e resumos de decisões", icon: Bot },
  { nome: "ViaCEP & Correios", badge: "Tempo Real", desc: "Preenchimento automático de endereços por CEP", icon: Globe },
  { nome: "Receita Federal", badge: "CNPJ & Quadro Sócios", desc: "Consulta de razão social, QSA e capital social", icon: Building2 },
  { nome: "ClicSign", badge: "ICP-Brasil", desc: "Assinatura digital de contratos e procurações", icon: FileSignature },
  { nome: "Supabase Database", badge: "Segurança & Criptografia", desc: "Armazenamento em nuvem de alta velocidade e privacidade", icon: Lock },
];

const planos = [
  {
    nome: "Starter",
    preco: "R$ 97",
    periodo: "/mês",
    desc: "Para advogados autônomos e pequenos escritórios",
    features: [
      "Até 50 processos monitorados no Supabase",
      "Consultas no DataJud / CNJ ilimitadas",
      "Busca CEP & CNJ na Receita Federal",
      "Calculadoras trabalhistas e cíveis ilimitadas",
      "Gerador de Procurações PDF",
      "30 resumos com IA por mês",
    ],
    btn: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  {
    nome: "Professional",
    preco: "R$ 197",
    periodo: "/mês",
    desc: "Ideal para advogados em crescimento e bancas ativas",
    popular: true,
    features: [
      "Até 200 processos monitorados",
      "DataJud CNJ em tempo real com alertas",
      "Petições e Assistente IA (Gemini 1.5) Ilimitados",
      "Integração ClicSign para Assinaturas Digitais",
      "Consultas Gov (CEP, CNPJ, Tabela FIPE)",
      "Gestão Financeira & Honorários",
      "Vade Mecum Digital Integrado",
      "Suporte Prioritário por WhatsApp",
    ],
    btn: "bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-lg shadow-amber-500/25",
  },
  {
    nome: "Escritório",
    preco: "R$ 397",
    periodo: "/mês",
    desc: "Para bancas consolidadas e equipes jurídicas",
    features: [
      "Processos ilimitados monitorados",
      "Multi-usuário (até 10 advogados)",
      "Tudo do plano Professional incluído",
      "Gerador de Petições IA Ilimitado",
      "Relatórios de Rentabilidade & Honorários",
      "Gerente de Conta Dedicado",
    ],
    btn: "bg-slate-900 hover:bg-slate-800 text-white",
  },
];

const faqs = [
  {
    q: "O teste de 14 dias é realmente gratuito?",
    a: "Sim, 100% gratuito. Não solicitamos cartão de crédito no cadastro. Você pode testar todas as funcionalidades durante 14 dias sem compromisso.",
  },
  {
    q: "As consultas no DataJud / CNJ são oficiais?",
    a: "Sim. O LexAI se conecta diretamente à API pública oficial do DataJud (Conselho Nacional de Justiça), trazendo dados e movimentações reais de tribunais estaduais, federais e trabalhistas de todo o Brasil.",
  },
  {
    q: "Como funciona a geração de petições por IA?",
    a: "Nossa IA utiliza o modelo Google Gemini 1.5 Flash treinado com diretrizes do Direito Brasileiro (CPC, CLT, CPP e CF/88) para criar rascunhos de minutas fundamentadas, prontas para revisão profissional.",
  },
  {
    q: "Meus dados e de meus clientes estão seguros?",
    a: "Totalmente seguros. Utilizamos banco de dados PostgreSQL com criptografia e isolamento por workspace no Supabase, em conformidade estrita com a LGPD.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-500 selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-bold text-slate-900 tracking-tight">
                  Lex<span className="text-amber-500">AI</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  Plataforma Jurídica
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
              <a href="#funcionalidades" className="hover:text-slate-900 transition-colors">Funcionalidades</a>
              <a href="#integracoes" className="hover:text-slate-900 transition-colors">Integrações</a>
              <a href="#planos" className="hover:text-slate-900 transition-colors">Planos</a>
              <a href="#faq" className="hover:text-slate-900 transition-colors">Dúvidas</a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth/signin" className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all">
                Entrar
              </Link>
              <Link href="/auth/signup" className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Testar 14 Dias Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-28 sm:pt-36 pb-20 bg-slate-900 text-white relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6 shadow-sm max-w-full">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-amber-300 text-xs font-semibold truncate">
                Conectado ao DataJud / CNJ, Receita Federal & Google Gemini IA
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight max-w-5xl mx-auto">
              A Plataforma Inteligente que Transformará o Ritmo da Sua Advocacia
            </h1>

            <p className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              Consulte processos no <strong className="text-amber-400">DataJud CNJ</strong>, elabore minutas jurídicas com <strong className="text-amber-400">IA</strong>, envie documentos para assinatura digital e gerencie prazos e honorários em um único painel.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
              <Link href="/auth/signup" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-sm py-4 px-8 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95">
                Começar 14 Dias Grátis sem Cartão
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/signin" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all">
                Acessar Demonstração
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto border-t border-slate-800 pt-10 text-left">
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">100%</p>
              <p className="text-slate-400 text-xs mt-1">Tribunais do Brasil (DataJud)</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">13+</p>
              <p className="text-slate-400 text-xs mt-1">Cálculos Jurídicos Exatos</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">Gemini 1.5</p>
              <p className="text-slate-400 text-xs mt-1">IA Jurídica Especializada</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">ICP-Brasil</p>
              <p className="text-slate-400 text-xs mt-1">Assinaturas via ClicSign</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRAÇÕES DESTAQUE */}
      <section id="integracoes" className="py-20 bg-slate-100/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Conexões Diretas
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-4 tracking-tight">
              APIs Públicas &amp; Provedores Conectados em Tempo Real
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              Sem dados fictícios ou simulações. O LexAI faz chamadas diretas às fontes oficiais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integracoes.map((item) => (
              <div key={item.nome} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{item.nome}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Conexão Ativa
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="funcionalidades" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3.5 py-1.5 rounded-full">
            Suíte Jurídica Completa
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-4 tracking-tight">
            Ferramentas Desenvolvidas para Advogados de Alta Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* PLANOS */}
      <section id="planos" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Investimento Transparente
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-4 tracking-tight">
              Planos sem Fidelidade e sem Pegadinhas
            </h2>
            <p className="text-slate-400 text-sm mt-2">Cancele a qualquer momento direto pelo seu painel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planos.map((plano) => (
              <div
                key={plano.nome}
                className={`bg-slate-800/90 rounded-3xl p-8 border ${plano.popular ? "border-amber-500 ring-2 ring-amber-500/30 shadow-2xl bg-slate-800" : "border-slate-700/80 shadow-sm"} relative flex flex-col justify-between`}
              >
                {plano.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Mais Recomendado
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-white text-xl">{plano.nome}</h3>
                  <p className="text-slate-400 text-xs mt-1">{plano.desc}</p>

                  <div className="my-6">
                    <span className="font-display text-4xl font-extrabold text-amber-400">{plano.preco}</span>
                    <span className="text-slate-400 text-xs">{plano.periodo}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plano.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/auth/signup"
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold text-center block transition-all active:scale-95 ${plano.btn}`}
                >
                  Testar 14 Dias Grátis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Perguntas Frequentes</h2>
          <p className="text-slate-500 text-sm mt-2">Tudo o que você precisa saber sobre o LexAI.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-2">{faq.q}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-display text-base font-bold text-white">LexAI</span>
          </div>
          <p>© 2026 LexAI. Todos os direitos reservados. Conectado ao DataJud / CNJ.</p>
        </div>
      </footer>
    </div>
  );
}
