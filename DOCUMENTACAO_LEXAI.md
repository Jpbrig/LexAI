# ⚖️ LexAI — Documentação Técnica & Guia de Arquitetura SaaS

> **Versão:** 1.0.0  
> **Data:** Setembro de 2026  
> **Tecnologias:** Next.js 16 (Turbopack), React 19, Prisma ORM, PostgreSQL (Supabase), NextAuth.js v5, Tailwind CSS, Lucide React, Google Gemini 1.5 Pro, DataJud CNJ, ClicSign.

---

## 📋 Sumário Executivo

O **LexAI** é um ecossistema SaaS B2B completo desenvolvido para automatizar a gestão de escritórios de advocacia, busca de processos nos tribunais, geração de petições com inteligência artificial, ditado por voz e assinaturas digitais de contratos.

---

## 🏰 1. Matriz de Hierarquia & Perfis de Usuário

O sistema opera em uma estrutura de permissões em **2 Camadas Decopladas**:

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1 — PLATFORM ADMIN (Admin Master)                   │
│  Super Admin da Plataforma — Controle Global SaaS           │
│  • Acesso exclusivo ao Painel /dashboard/admin              │
│  • Gerencia todos os usuários e promove outros admins       │
│  • Altera planos de qualquer cliente (FREE, STARTER, etc.)  │
│  • Configura chaves de API globais (Gemini, ClicSign...)    │
│  • Acessa métricas financeiras globais (MRR, Churn)         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴──────────────┐
              ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐
    │  Escritório A    │          │  Escritório B    │
    │  (Workspace 1)   │          │  (Workspace 2)   │
    └──────────────────┘          └──────────────────┘
              │
     ┌────────┴──────────────────────────────────┐
     │  CAMADA 2 — WORKSPACE ROLES (Advogados)   │
     │                                           │
     │  OWNER      Sócio Titular (Dono do Ws)    │
     │  ADMIN      Sócio Associado               │
     │  MEMBER     Advogado Associado            │
     │  READ_ONLY  Estagiário / Secretária       │
     └───────────────────────────────────────────┘
```

### 1.1. Camada 1: Nível de Plataforma (`platformRole`)

Definido no enum `PlatformRole` do Prisma Schema:

| Perfil | Descrição | Escopo de Acesso |
|---|---|---|
| 👑 **`PLATFORM_ADMIN`** | Admin Master / Fundador do SaaS | **Global (Todos os Escritórios)**. Acessa o `/dashboard/admin`, visualiza métricas de MRR, edita permissões de todos os usuários, desbloqueia contas e gerencia chaves de API. |
| 👨‍⚖️ **`USER`** | Advogado Cliente / Membro do Escritório | **Local (Apenas o seu Workspace)**. Utiliza as ferramentas da plataforma (Petições IA, DataJud, Clientes, Agenda) sem acesso a configurações administrativas do SaaS. |

### 1.2. Camada 2: Nível de Escritório (`WorkspaceRole`)

Definido no enum `WorkspaceRole` do Prisma Schema para gerenciar equipes internas:

| Cargo no Escritório | Permissões no Workspace |
|---|---|
| **`OWNER`** | Sócio Titular. Convida/remove membros do escritório, altera cartão de crédito e gerencia configurações da banca. |
| **`ADMIN`** | Sócio Associado. Acessa todos os processos e clientes do escritório, convida membros MEMBER e READ_ONLY. |
| **`MEMBER`** | Advogado Associado. Cria e edita processos, gera petições por IA, pesquisa jurisprudência e cadastra clientes. |
| **`READ_ONLY`** | Estagiário / Secretária. Apenas visualiza processos e agenda. Não utiliza tokens de IA. |

---

## 🔑 2. Conectores & APIs Globais (Modelo Self-Service)

### 2.1. Conceito "Zero Configurações para o Advogado"

Diferente de sistemas legados que exigem que cada advogado crie contas de desenvolvedor, compre tokens ou insira chaves complexas, o **LexAI** adota o modelo **SaaS Centralizado**:

- O **Admin Master** gerencia as credenciais da plataforma no servidor.
- Os **Advogados clientes** recebem a infraestrutura 100% pronta para uso ao assinar o plano.

### 2.2. Provedores Integrados

| Provedor | Variável de Ambiente (`.env`) | Utilização no Sistema |
|---|---|---|
| 🤖 **Google Gemini 1.5 Pro** | `GEMINI_API_KEY` | Petições Iniciais, Resumos Executivos, Assistente de Voz |
| ⚖️ **DataJud / CNJ** | `DATAJUD_API_KEY` | Busca unificada em todos os Tribunais do Brasil (STF, STJ, TJs, TRFs) |
| ✍️ **ClicSign Assinaturas** | `CLICSIGN_API_KEY` | Assinatura digital ICP-Brasil de procurações e contratos |
| 🏛️ **Serpro PGFN** | `SERPRO_CLIENT_ID` | Certidões da Dívida Ativa da União e regularidade fiscal |
| 🚘 **SENATRAN / SINESP** | `SENATRAN_CLIENT_ID` | Busca de veículos, gravames e frotas para execução |
| 📧 **Resend** | `RESEND_API_KEY` | Envio de e-mails transacionais e notificações de andamentos |

---

## 🛡️ 3. Painel do Admin Master (`/dashboard/admin`)

O painel administrativo exclusivo do Admin Master é acessível pelo menu lateral e contém 4 abas estratégicas:

### 3.1. Indicadores de Desempenho (KPI Cards)
- **MRR Estimado (SaaS):** Receita recorrente mensal calculada dinamicamente com base nos planos ativos.
- **Escritórios (Tenants):** Total de bancas jurídicas cadastradas.
- **Usuários Totais:** Quantidade total de advogados e membros.
- **Processos Monitorados:** Volume de processos sincronizados com o DataJud.

### 3.2. Gerenciamento Completo de Usuários (`/api/admin/users`)
Permite ao Admin Master:
1. **Promover a Admin Master** ou **Rebaixar a USER** em 1 clique.
2. **Alterar o Plano do Usuário** (`FREE`, `STARTER`, `PROFESSIONAL`, `ESCRITORIO`).
3. **Desbloquear Conta** bloqueada por excesso de tentativas de senha (`lockedUntil`).
4. **Filtrar e Pesquisar** por nome, e-mail ou número de OAB.

### 3.3. Tabela de Escritórios Clientes
Visualização consolidada de cada tenant: Sócio titular, OAB, membros ativos, processos cadastrados e data de criação.

---

## 🎙️ 4. Ditado por Voz & Microfone no Navegador

O assistente jurídico conta com ditado de voz em tempo real:

- **Permissão do Navegador:** O `proxy.ts` inclui o cabeçalho de segurança:
  ```http
  Permissions-Policy: camera=(), microphone=(self), geolocation=()
  ```
- **Gravação Contínua:** Utiliza `SpeechRecognition` nativo do Web Speech API com modo contínuo (`continuous = true`).
- **Modal de Gravador:** Modal com animação pulsante ao gravar e transcrição automática para a caixa de mensagem.

---

## 🔐 5. Como Definir o Super Admin (Admin Master)

Existem duas formas suportadas para ativar o acesso de Admin Master:

### Método A: Por Variável de Ambiente (Recomendado na Vercel)
Adicione a variável no seu arquivo `.env` ou no painel da Vercel:
```env
PLATFORM_ADMIN_EMAIL="admin@lexai.com.br"
```
Ao fazer login com este e-mail, a callback do NextAuth e o Middleware automaticamente concedem o privilégio `PLATFORM_ADMIN`.

### Método B: Executando o Script de Seed
No ambiente local ou no servidor:
```bash
npx tsx prisma/seed.ts
```

---

## 🧪 6. Contas de Teste Pré-Configuradas

Para homologação local e testes de permissão, o script de seed disponibiliza duas contas padrão:

### 👑 1. Conta Super Admin (Admin Master)
- **E-mail:** `admin@lexai.com.br`
- **Senha:** `AdminMaster123!`
- **Indicador Visual:** Banner dourado **`👑 Modo Admin Master`** no cabeçalho superior e acesso completo a `/dashboard/admin`.

### 👨‍⚖️ 2. Conta Advogado Cliente
- **E-mail:** `advogado@escritorio.com.br`
- **Senha:** `Advogado123!`
- **Indicador Visual:** Badge verde **`🟢 Plano Escritório · OWNER`** e acesso restrito apenas ao próprio escritório.

---

## 💻 7. Comandos Úteis de Manutenção

| Comando | Descrição |
|---|---|
| `npx prisma db push` | Sincroniza o schema do Prisma com o banco Supabase PostgreSQL |
| `npx tsx prisma/seed.ts` | Popula o banco com os usuários e escritórios de teste |
| `npm run lint` | Executa a verificação estática de código com ESLint (0 erros) |
| `npm run build` | Compila a aplicação para produção com Next.js |
| `git push origin main` | Publica as alterações no repositório GitHub / Vercel |

---

> **LexAI** — *Tecnologia e Inteligência Artificial a serviço da Advocacia de Alta Performance.*
