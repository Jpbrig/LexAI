<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ⚖️ LexAI — Guia dos Agentes da IDE

Este repositório possui uma estrutura de agentes e regras em `.agents/` configuradas para orientar o assistente de IA no desenvolvimento e manutenção do ecossistema LexAI.

## 🛠️ Agentes e Skills do Projeto:
- **`code-auditor`**: Skill para auditoria de segurança RBAC (`auth-guard.ts`), validação Zod e rate-limiting com Upstash Redis.
- **`datajud-sync`**: Skill para integração com APIs do DataJud CNJ e identificação de tribunais.
- **`legal-petition-ai`**: Skill para engenharia de prompts e geração de resumos/petições com Google Gemini e OpenAI.

## 📜 Regras do Projeto:
- Todas as diretrizes gerais de desenvolvimento estão centralizadas em `.agents/rules/project-rules.md`.
