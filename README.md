# ⚖️ LexAI — Plataforma de Inteligência e Gestão Jurídica SaaS B2B

O **LexAI** é uma plataforma SaaS B2B desenvolvida para escritórios de advocacia e advogados autônomos. Ele combina um **ERP Jurídico Multi-tenant** leve com **Inteligência Artificial Generativa e Multimodal** (Google Gemini & OpenAI) para automação de triagem, redação de petições, pesquisa de jurisprudência e acompanhamento processual unificado.

---

## 🚀 Principais Funcionalidades

### 📋 1. Anamnese Jurídica & Triagem IA (Multimodal)
- **Ditado por Voz Nativo**: Reconhecimento de voz em tempo real via Web Speech API (`pt-BR`).
- **Transcrição Multimodal**: Upload e extração de fatos a partir de arquivos de áudio (MP3, WAV) e documentos (PDF, TXT) via Gemini 1.5 Flash.
- **Pré-Diagnóstico Jurídico**: Geração de parecer estruturado com identificação de tese jurídica, leis aplicáveis, análise de riscos/prescrição e documentos faltantes.
- **Notificação para WhatsApp**: Geração com 1 clique de mensagem simplificada em linguagem amigável ("sem juridiquês") para o cliente.

### 📄 2. Redator Inteligente de Petições & Procurações
- Geração automatizada de **Petição Inicial, Contestação, Recurso de Apelação, Réplica, Agravo de Instrumento, Habeas Corpus, Embargos de Declaração** e **Procurações**.
- Conexão direta com a Anamnese e com o Pesquisador de Jurisprudência (preenchimento automático de dados e citações ABNT/CPC com 1 clique).

### 🔍 3. Consultas e Conectores de Dados Públicos
- **DataJud CNJ API**: Captura de processos e movimentações dos principais tribunais (TJ, TRF, TRT, STJ, STF).
- **Pesquisador de Jurisprudências**: Busca unificada nos acervos oficiais do STF, STJ, TST, TJSP, TJRJ e Jusbrasil com citação formatada ABNT.
- **Consultas Públicas / OSINT**: Estrutura preparada para integração com SERPRO, SENATRAN, INPI e IEPTB (Protestos de Títulos).

### 📊 4. Ferramentas Operacionais & Assinatura Digital
- **13 Calculadoras Jurídicas**: Liquidação de sentença trabalhista, atualização monetária e contagem de prazos em dias úteis.
- **ClicSign API Integration**: Envio e monitoramento do status de assinaturas digitais em procurações e contratos.
- **Vade Mecum Digital**: Consulta rápida à legislação brasileira vigente.

---

## 🛡️ Arquitetura, Segurança e Performance

- **Framework**: Next.js 16 (App Router) com React 19 em ambiente Serverless.
- **Banco de Dados**: PostgreSQL (Supabase) via Prisma ORM com Connection Pooling.
- **Autenticação & RBAC**: NextAuth.js v5 (Auth.js) com verificação em banco e 7 papéis de acesso (`OWNER`, `ADMIN`, `LAWYER`, `SECRETARY`, `INTERN`, `READ_ONLY`, `MEMBER`).
- **Rate Limiting Distribuído**: Upstash Redis (`@upstash/ratelimit`) ativo em todas as rotas de IA para conter ataques de exaustão e abuso.
- **Observabilidade & APM**: Logger estruturado em JSON (`src/lib/logger.ts`) com medição de tempo de execução (`logger.trace`) e sanitização automática de tokens/chaves sensíveis.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js**: v18.x ou superior
- **PostgreSQL**: Instância local ou Supabase
- **Upstash Redis**: URL e Token REST

### Configuração do Ambiente (.env)
Crie um arquivo `.env` na raiz do projeto contendo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/lexai?schema=public"
DIRECT_URL="postgresql://usuario:senha@localhost:5432/lexai?schema=public"
NEXTAUTH_SECRET="sua_chave_secreta_aqui"
NEXTAUTH_URL="http://localhost:3000"

GEMINI_API_KEY="sua_chave_gemini"
OPENAI_API_KEY="sua_chave_openai"

UPSTASH_REDIS_REST_URL="https://seu-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="seu_token_upstash"
```

### Instalação de Dependências e Banco de Dados
```bash
# 1. Instalar dependências
npm install

# 2. Gerar cliente do Prisma
npx prisma generate

# 3. Executar migrações do banco
npx prisma migrate dev

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

---

## 🧪 Suíte de Testes Automatizados

O projeto utiliza **Vitest** para testes unitários de alta performance.

```bash
# Executar a suíte completa de testes
npm test -- --run

# Executar em modo watch
npm run test:watch
```

---

## 📜 Licença
Propriedade privada de LexAI. Todos os direitos reservados.
