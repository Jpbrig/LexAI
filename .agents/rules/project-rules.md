# LexAI — Regras Gerais e Diretrizes do Projeto

## 1. Convenções de Arquitetura e Framework
- **Next.js 16 (App Router):** Utilizar `proxy.ts` (na raiz do `src/`) para tratamento de requisições e headers de segurança, respeitando as mudanças do Next.js 16.
- **Server vs Client:** Prefira React Server Components (RSC) por padrão. Utilize `"use client"` apenas em componentes interativos.
- **TypeScript Estrito:** NUNCA ignore erros de tipo ou utilize `any` sem o devido *casting* defensivo (ex: `as Record<string, unknown>`).

## 2. Multi-tenant e Segurança (RBAC)
- **Autorização Obrigatória:** Toda API em `/app/api/` (exceto públicas ou de login) DEVE invocar `getAuthContext()` de `@/lib/auth-guard`.
- **Validação de Permissões:** Checar permissões via `hasPermission(context, PERMISSIONS.RECURSO_ACAO)` em `@/lib/authorization`. Nunca confiar em papeis enviados pelo cliente.
- **Rate Limiting:** Endpoints sensíveis e de alto consumo (DataJud, IA, Auth) DEVEM utilizar `await isRateLimited(req, scope, limit, windowMs)` de `@/lib/rate-limit`.

## 3. Banco de Dados e Integrações
- **Prisma ORM:** Manter esquemas centralizados em `prisma/schema.prisma`.
- **Credenciais de Integração:** Utilizar `getWorkspaceIntegrationValue(workspaceId, provider, envFallback)` de `@/lib/integration-credentials` para suporte ao modelo SaaS centralizado com suporte a BYOK (Bring Your Own Key).
- **Timeouts Defensivos:** Sempre envolver chamadas a APIs externas (DataJud, Gemini, OpenAI, ClicSign) com `AbortController` (timeout padrão de 10s a 30s).
