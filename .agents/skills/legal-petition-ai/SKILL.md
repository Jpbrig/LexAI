---
name: legal-petition-ai
description: Gerenciamento de prompts, geração de petições e resumos de movimentações com Google Gemini e OpenAI.
---

# Legal Petition AI — LexAI

Skill focada nos assistentes generativos de Inteligência Artificial Jurídica do LexAI.

## Regras de Geração com IA:
- **Resumos de Movimentações:**
  - Linguagem objetiva em português do Brasil (máximo 150 palavras).
  - Início com emoji e status claro.
  - Alertas sobre prazos prescricionais/processuais relevantes.
  - Proibição estrita de invenção de leis, artigos ou prazos (*hallucination prevention*).
- **Modelos Suportados:**
  - Primário: Google Gemini 1.5 Flash / Pro (via `GEMINI_API_KEY`).
  - Fallback: OpenAI GPT-4o-mini (via `OPENAI_API_KEY`).
- **Performance:** As chaves de integração devem ser buscadas uma única vez por requisição para evitar chamadas redundantes ao PostgreSQL.
