# LexAI — Referência Completa das APIs

## Visão geral

Este documento consolida as rotas HTTP expostas pelo sistema LexAI em Next.js App Router, incluindo autenticação, regras de acesso, payloads esperados e integrações externas.

## 1. Convenções gerais

### Base de autenticação
- Todas as rotas de funcionalidade autenticadas usam `getAuthContext()` em `src/lib/auth-guard.ts`.
- Quando a sessão não existe ou é inválida, as rotas retornam `401`.
- Quando o usuário não tem permissão suficiente, retornam `403`.

### Regras comuns
- `GET` normalmente lê dados do workspace ativo da sessão.
- `POST` cria recursos.
- `PATCH` atualiza recursos existentes.
- `DELETE` remove memberships ou recursos específicos.
- Respostas em JSON com erros padronizados no formato `{ error: string }`.

### Papel da sessão
A sessão ativa traz:
- `userId`
- `workspaceId`
- `sessionId`
- `role` (WorkspaceRole)
- `isPlatformAdmin`

### Roles do workspace
- `OWNER`
- `ADMIN`
- `LAWYER`
- `INTERN`
- `SECRETARY`
- `MEMBER` (legado)
- `READ_ONLY` (legado)

### Roles de plataforma
- `USER`
- `PLATFORM_ADMIN`

---

## 2. Autenticação e usuário

### `GET /api/auth/[...nextauth]`
- Rota padrão do NextAuth.
- Exibe e controla autenticação do sistema.
- `GET` usa `auth()`; se o usuário for `PLATFORM_ADMIN`, permite acesso administrativo global.

### `POST /api/auth/forgot-password`
- Solicita recuperação de senha.
- Payload:
  ```json
  {
    "email": "advogado@exemplo.com"
  }
  ```
- Resposta neutra por segurança: sempre responde com mensagem genérica quando o e-mail não existe.
- Requer `RESEND_API_KEY` e `EMAIL_FROM` para envio real.

### `POST /api/auth/reset-password`
- Redefine senha com token recebido por e-mail.
- Payload:
  ```json
  {
    "token": "<token-hex>",
    "password": "NovaSenha123!"
  }
  ```

### `GET /api/user`
- Retorna o perfil do usuário autenticado.
- Requer autenticação.

### `PATCH /api/user`
- Atualiza dados do perfil.
- Também aceita troca de senha com `currentPassword` e `newPassword`.
- Requer autenticação.
- Quando troca senha, revoga outras sessões ativas do usuário.

### `POST /api/user`
- Cria novo cadastro no sistema.
- Cria automaticamente:
  - `User`
  - `Workspace`
  - `Membership` com `OWNER`
- Payload principal:
  ```json
  {
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "SenhaSegura123!",
    "oab": "123456"
  }
  ```

---

## 3. Dashboard e onboarding

### `GET /api/dashboard`
- Retorna visão geral do workspace atual.
- Requer autenticação.
- Resposta inclui:
  - `user`
  - `stats`
  - `onboardingState`
  - `recentMovimentacoes`

Exemplo de resposta:
```json
{
  "user": {
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "oab": "123456",
    "plano": "PROFESSIONAL"
  },
  "stats": {
    "totalProcessos": 42,
    "processosAtivos": 18,
    "movimentacoesHoje": 9,
    "totalAlertas": 4
  },
  "onboardingState": {
    "workspace": true,
    "processos": false,
    "clientes": true,
    "assistente": false
  },
  "recentMovimentacoes": []
}
```

### `PATCH /api/dashboard/onboarding`
- Persiste estado do onboarding por sessão.
- Payload:
  ```json
  {
    "state": {
      "workspace": true,
      "processos": true,
      "clientes": false,
      "assistente": false
    }
  }
  ```
- Retorna `onboardingState` salvo.

---

## 4. Processos

### `GET /api/processos`
- Lista processos do workspace autenticado.
- Inclui a última movimentação de cada processo.
- Requer autenticação.

### `POST /api/processos`
- Cria um novo processo.
- Requer autenticação e permissão de mutação (`canMutate`).
- Payload:
  ```json
  {
    "numeroCnj": "0001234-67.2024.8.26.0001",
    "tribunal": "TJSP",
    "classe": "Ação Cível",
    "assunto": "Direito do Consumidor",
    "orgaoJulgador": "Vara Única",
    "notas": "Observações relevantes"
  }
  ```
- Cria também uma movimentação inicial e um alerta.

### `GET /api/processos/[id]`
- Retorna detalhes completos de um processo pelo `id`.
- Requer autenticação.
- Inclui movimentações e alertas do workspace.

---

## 5. Agenda e alertas

### `GET /api/agenda`
- Lista eventos da agenda do workspace autenticado.
- Requer autenticação.

### `POST /api/agenda`
- Cria evento na agenda.
- Requer autenticação e permissão de mutação.
- Payload:
  ```json
  {
    "titulo": "Audiência",
    "data": "2026-09-12",
    "hora": "14:30",
    "descricao": "Audiência de conciliação",
    "status": "PENDENTE"
  }
  ```

### `PATCH /api/agenda`
- Atualiza status do evento.
- Payload:
  ```json
  {
    "id": "evento-id",
    "status": "REALIZADO"
  }
  ```

### `GET /api/alertas`
- Lista alertas do workspace autenticado.
- Requer autenticação.

### `POST /api/alertas`
- Cria alerta para um processo.
- Requer autenticação e permissão de mutação.

### `PATCH /api/alertas`
- Ativa ou desativa um alerta.
- Payload:
  ```json
  {
    "id": "alerta-id",
    "ativo": false
  }
  ```

---

## 6. Clientes e membros

### `GET /api/clientes`
- Lista clientes do workspace autenticado.
- Retorna também `processosCount`.
- Requer autenticação.

### `POST /api/clientes`
- Cria cliente no workspace.
- Requer autenticação e permissão de mutação.

### `GET /api/workspace/members`
- Lista membros do workspace.
- Retorna dados de usuário, perfil visual, status e role.
- Requer autenticação.

### `POST /api/workspace/members/invite`
- Cria convite para novo membro.
- Requer autenticação e `canManageWorkspace`.
- Payload:
  ```json
  {
    "name": "Maria Souza",
    "email": "maria@exemplo.com",
    "role": "ASSOCIATE"
  }
  ```
- O backend converte um perfil visual em role do banco:
  - `ADMIN` -> `ADMIN`
  - `ASSOCIATE` -> `MEMBER`
  - `INTERN` / `SECRETARY` -> `READ_ONLY`

### `DELETE /api/workspace/members/[id]`
- Remove um membro do workspace.
- Requer autenticação e controle de workspace.
- Bloqueia remoção do titular (`OWNER`) e de si mesmo.

---

## 7. IA e geração de conteúdo

### `POST /api/ai/assistente`
- Assistente jurídico conversacional com memória por sessão.
- Requer autenticação.
- Payload pode receber:
  ```json
  {
    "text": "Preciso resumir esta movimentação processual",
    "messages": [
      { "role": "user", "text": "Mensagem anterior" },
      { "role": "assistant", "text": "Resposta anterior" }
    ]
  }
  ```
- O backend usa:
  - perfil do usuário
  - role no workspace
  - plano
  - OAB
  - `platformRole`
  - memória da sessão (`aiMemory`)
- Resposta:
  ```json
  {
    "resposta": "Texto gerado pela IA"
  }
  ```

### `POST /api/ai/resumo`
- Gera resumo textual a partir de um texto de entrada.
- Requer autenticação.
- Payload:
  ```json
  {
    "texto": "Texto da movimentação ou documento",
    "tipo": "movimentação processual"
  }
  ```
- Usa Gemini ou OpenAI conforme variáveis configuradas.

### `POST /api/peticoes/gerar`
- Gera peças processuais com IA.
- Requer autenticação.
- Payload principal:
  ```json
  {
    "tipoPeca": "inicial",
    "requerente": "João Silva",
    "requerido": "Empresa Teste Ltda.",
    "juizo": "Vara Cível",
    "fatos": "Descreva o caso",
    "pedidos": "Pedidos formulados",
    "valorCausa": "R$ 50.000,00",
    "numeroProcesso": ""
  }
  ```
- Suporta tipos como:
  - `inicial`
  - `contestacao`
  - `recurso`
  - `replica`
  - `agravo`
  - `hc`
  - `embargos`
  - `procuracao_ad_judicia`
  - `procuracao_especial`
  - `procuracao_administrativa`
  - `procuracao_substabelecimento`

---

## 8. Consultas governamentais e integrações externas

### `POST /api/consultas/gov`
- Endpoint de consultoria pública multi-provedor.
- Requer autenticação.
- Payload:
  ```json
  {
    "tipo": "cep",
    "termo": "01310-200"
  }
  ```
- Tipos suportados:
  - `cep`
  - `buscador`
  - `empresas`
  - `grupo_cnpj`
  - `relacionamentos`
  - `cpf_status`
  - `veiculo`
  - `rastreio_veiculo`
  - `marcas`
  - `credito`
  - `localizacao`
  - `feriados`
  - `bancos`
  - `cnh`
  - `profissionais`

### `POST /api/datajud/buscar`
- Busca por processos usando DataJud / CNJ.
- Requer autenticação.
- Payload:
  ```json
  {
    "termo": "nome da parte"
  }
  ```

### `POST /api/jurisprudencia/buscar`
- Busca jurisprudência com fluxo oficial e assistido por IA.
- Requer autenticação.
- Payload:
  ```json
  {
    "termo": "responsabilidade civil",
    "tribunal": "TODOS"
  }
  ```

### `POST /api/jusbrasil/buscar`
- Adaptador do Jusbrasil.
- Requer autenticação.
- Atualmente retorna `503` com instrução de habilitação do provedor.

### `POST /api/gov-query`
- Compatibilidade/alias para consultas públicas.
- `GET` e `POST` aceitam `tipo` e `termo` por query string ou body.

---

## 9. Admin / plataforma

### `GET /api/admin/stats`
- Estatísticas globais para `PLATFORM_ADMIN`.
- Requer autenticidade de admin da plataforma.
- Retorna métricas de workspaces, usuários, processos e clientes.

### `GET /api/admin/organizations`
- Lista tenants/workspaces.
- Requer `PLATFORM_ADMIN`.

### `POST /api/admin/organizations`
- Cria um workspace (tenant) e um owner.
- Requer `PLATFORM_ADMIN`.

### `GET /api/admin/organizations/[id]`
- Detalha workspace por id.
- Requer `PLATFORM_ADMIN`.

### `PATCH /api/admin/organizations/[id]`
- Atualiza nome ou altera status do workspace por ação.
- Requer `PLATFORM_ADMIN`.

### `GET /api/admin/users`
- Lista usuários do sistema para admin master.
- Requer `PLATFORM_ADMIN`.

### `PATCH /api/admin/users`
- Atualiza `platformRole`, plano ou desbloqueia conta.
- Requer `PLATFORM_ADMIN`.

---

## 10. Assinaturas digitais

### `POST /api/assinaturas/clicsign/enviar`
- Envia documento para assinatura digital via ClicSign.
- Requer autenticação.
- Depende de `CLICSIGN_API_KEY` e configuração do ambiente.

---

## 11. Variáveis de ambiente relevantes

As principais variáveis esperadas pelo sistema são:

```env
AUTH_SECRET=
AUTH_URL=
DATABASE_URL=
DIRECT_URL=

DATAJUD_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
EMAIL_FROM=
CLICSIGN_API_KEY=
CLICSIGN_ENV=sandbox

JUSBRASIL_API_URL=
JUSBRASIL_API_KEY=

SERPRO_API_URL=
SERPRO_CLIENT_ID=
SERPRO_CLIENT_SECRET=

SENATRAN_API_URL=
SENATRAN_CLIENT_ID=
SENATRAN_CLIENT_SECRET=

INPI_API_URL=
INPI_API_KEY=

IEPTB_API_URL=
IEPTB_API_KEY=

PLATFORM_ADMIN_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CRON_SECRET=
INTEGRATION_ENCRYPTION_KEY=
```

---

## 12. Observações de arquitetura

### Persistência
- Prisma é o ORM principal.
- O modelo `AppSession` armazena:
  - `aiMemory`
  - `onboardingState`
- Usuários, workspaces, memberships, processos, clientes, alertas e agenda ficam no banco principal do projeto.

### Segurança
- O sistema valida sessão, workspace e role em cada rota usando `getAuthContext()`.
- Não confia em dados enviados pelo frontend para decidir permissões.
- A lógica de autorização funcional fica em `src/lib/authorization.ts`.

### IA
- O assistente jurídico usa Gemini e recebe contexto do usuário para personalização por perfil.
- O resumo e geração de peças usam Gemini por padrão, com fallback para OpenAI em alguns fluxos.

---

## 13. Conclusão

O LexAI expõe um conjunto de APIs coerente para:
- autenticação e perfil
- dashboard e onboarding
- gestão de clientes, processos e agenda
- IA assistente, resumo e geração de peças
- consultas oficiais e integrações externas
- administração global do SaaS

Esta referência cobre os endpoints presentes no projeto e serve como base para evolução, testes, integração com clientes e documentação operacional.
