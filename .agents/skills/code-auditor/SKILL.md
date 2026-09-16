---
name: code-auditor
description: Audita APIs, segurança RBAC, rate-limiting e conformidade com Next.js 16 no LexAI.
---

# Code Auditor — LexAI

Esta skill fornece instruções para auditar e garantir a conformidade dos endpoints e componentes do LexAI.

## Passos da Auditoria:

1. **Checagem de Autenticação:**
   - Verificar se o endpoint possui `const context = await getAuthContext();`
   - Garantir retorno de `unauthorizedResponse()` se `!context`.

2. **Checagem de Permissão (RBAC):**
   - Verificar se `hasPermission(context, PERMISSIONS....)` é chamado.
   - Retornar `forbiddenResponse()` caso a permissão seja negada.

3. **Rate Limiting:**
   - Checar se a rota consome APIs pagas (Gemini, DataJud, OpenAI).
   - Validar a presença de `if (await isRateLimited(req, scope, limit, windowMs))`.

4. **Validação de Inputs:**
   - Confirmar o uso de `zod` com `safeParse()`.
   - Garantir que respostas de erro 400 tratem corretamente campos inválidos.

