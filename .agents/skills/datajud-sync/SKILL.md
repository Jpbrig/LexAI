---
name: datajud-sync
description: Instruções e rotinas de sincronização de processos e tribunais via API DataJud CNJ.
---

# DataJud Sync — LexAI

Skill especializada no ecossistema de integração de processos judiciais via DataJud (Conselho Nacional de Justiça).

## Diretrizes de Integração:
- **Detecção de Tribunal:** A função `detectarTribunal(numeroCnj)` faz o parsing do número único CNJ (`NNNNNNN-DD.AAAA.J.TR.OOOO`).
- **Endpoints por Tribunal:** Mapeamento em `tribunalEndpoints` (ex: TJSP, TJRJ, TRF1..TRF6, STJ, STF).
- **Chave de API:** Recuperada via `getWorkspaceIntegrationValue(workspaceId, "DATAJUD", "DATAJUD_API_KEY")`.
- **Tratamento de Timeouts:** Respostas que excedam 10s geram erro `504` (Gateway Timeout).
