# Guia de configuração das APIs externas do LexAI

Este documento explica como configurar e ativar as integrações externas previstas no LexAI quando você tiver as chaves ou credenciais dos provedores.

## Visão geral

O LexAI já está preparado para consumir integrações externas em rotas do tipo:

- `src/app/api/consultas/gov/route.ts`
- `src/app/api/datajud/buscar/route.ts`
- `src/app/api/jusbrasil/buscar/route.ts`
- `src/app/api/ai/assistente/route.ts`
- `src/app/api/ai/resumo/route.ts`
- `src/app/api/assinaturas/clicsign/enviar/route.ts`

As APIs de consulta adicionais já foram preparadas no fluxo de consultas públicas do sistema, com suporte para variáveis de ambiente e respostas JSON padronizadas.

## Arquivos relevantes

- Variáveis de ambiente: `src/lib/env.ts`
- Rota principal de consultas: `src/app/api/consultas/gov/route.ts`
- Rota pública compatível: `src/app/api/gov-query/route.ts`
- UI de consultas: `src/app/dashboard/ferramentas/_components/tab-consultas.tsx`
- Schema de integrações: `prisma/schema.prisma`

## Variáveis de ambiente suportadas

No arquivo `src/lib/env.ts`, já existem as seguintes chaves preparadas para integrações externas:

```env
DATAJUD_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
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
```

## Como o LexAI usa essas APIs

### 1) DataJud / CNJ

Objetivo:
- buscar processo por número CNJ
- atualizar dados processuais

Status no projeto:
- já implementado e funcionando com `DATAJUD_API_KEY`

Rota:
- `src/app/api/datajud/buscar/route.ts`

Exemplo de `.env`:

```env
DATAJUD_API_KEY=sua_chave_datajud
```

---

### 2) Serpro PGFN / CADIN

Objetivo:
- consulta de devedores
- consulta de dívida ativa e regularidade fiscal

Status no projeto:
- suporte de configuração adicionado, ainda depende de chave/contrato real

Variáveis:

```env
SERPRO_API_URL=https://api.serpro.gov.br/...
SERPRO_CLIENT_ID=seu_client_id
SERPRO_CLIENT_SECRET=seu_client_secret
```

Observações:
- o sistema envia `Authorization: Basic base64(clientId:clientSecret)`
- a rota atual usa `SERPRO_API_URL` e o parâmetro `q`

Caso a API não esteja disponível ou a credencial falhe, a rota retornará erro `503` ou `502` com mensagem clara.

---

### 3) INPI

Objetivo:
- consulta de marcas e patentes
- busca de registros industriais

Status no projeto:
- suporte adicionado, mas depende de configuração real da API do INPI

Variáveis:

```env
INPI_API_URL=https://api.inpi.gov.br/...
INPI_API_KEY=sua_chave_inpi
```

Observações:
- o sistema usa `Authorization: Bearer <INPI_API_KEY>`
- a rota passa o termo de busca em query string como `q`

Nota:
- caso a API do INPI exija outra autenticação, o código pode precisar de ajuste específico

---

### 4) SENATRAN / SINESP

Objetivo:
- consulta de veículos
- pesquisa por placa ou RENAVAM
- gravame, situação e dados de veículo

Status no projeto:
- suporte adicionado para URL e credenciais, ainda depende do provedor real

Variáveis:

```env
SENATRAN_API_URL=https://api.exemplo.com/senatran
SENATRAN_CLIENT_ID=seu_client_id
SENATRAN_CLIENT_SECRET=seu_client_secret
```

Observações:
- a integração usa `Authorization: Basic base64(clientId:clientSecret)`
- a rota envia `q` e `tipo` (`placa` ou `renavam`)

Importante:
- a consulta de veículos pode exigir contrato ou integração externa específica, pois a API pública genérica não é suficiente para todos os cenários

---

### 5) IEPTB

Objetivo:
- consultas de protestos e restrição de crédito
- busca em bases de protesto

Status no projeto:
- suporte adicionado, depende de URL real e chave do provedor

Variáveis:

```env
IEPTB_API_URL=https://api.ieptb.com.br/...
IEPTB_API_KEY=sua_chave_ieptb
```

Observações:
- a rota usa `Authorization: Bearer <IEPTB_API_KEY>`
- o termo é enviado como `q`

---

### 6) Jusbrasil real

Objetivo:
- busca por CPF, nome ou empresa
- suporte para resultados processuais e perfis relevantes

Status no projeto:
- suporte de configuração adicionado, mas a integração real ainda precisa ser habilitada conforme o contrato do provedor

Variáveis:

```env
JUSBRASIL_API_URL=https://api.provedor.com/jusbrasil
JUSBRASIL_API_KEY=sua_chave_jusbrasil
```

Observações:
- o código já espera `JUSBRASIL_API_URL` e `JUSBRASIL_API_KEY`
- a rota usa `Authorization: Bearer <JUSBRASIL_API_KEY>`
- a rota atual envia `q` e `tipo`

Importante:
- o Jusbrasil é um provedor que normalmente exige contrato ou formato oficial específico; o projeto já está pronto para receber essa integração, mas ainda precisa da URL e do formato real do endpoint

---

## Exemplo de arquivo `.env` completo

```env
# Autenticação principal
AUTH_SECRET=seu_secret
AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# APIs já integradas
DATAJUD_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
CLICSIGN_API_KEY=
CLICSIGN_ENV=sandbox

# APIs adicionais preparadas
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
```

## Como testar depois de configurar

1. Adicione as variáveis no `.env`
2. Reinicie a aplicação
3. Acesse a aba de consultas do dashboard
4. Teste cada tipo de consulta
5. Verifique se a resposta retorna corretamente

## O que o sistema espera de volta

A rota de consultas no LexAI espera respostas em JSON e, idealmente, com um retorno padronizado. O código já aceita respostas com estruturas por exemplo:

```json
{
  "sucesso": true,
  "tipo": "marcas",
  "fonte": "INPI (configuração do provedor)",
  "dados": {
    "resultado": []
  }
}
```

Ou também pode devolver uma estrutura mais livre, desde que a UI seja capaz de renderizar `resultadoGov.dados` e `resultadoGov.fonte`.

## Observações importantes

### 1) Endpoints podem variar

Mesmo que o projeto esteja pronto para receber chamadas externas, cada provedor pode exigir:

- autenticação diferente (`Bearer`, `Basic`, `APIKey`)
- parâmetro diferente (`q`, `termo`, `query`, `cpf`, `cnpj`)
- resposta JSON com campos diferentes

### 2) Fallbacks já existem

O sistema já mantém fallback para consultas públicas gratuitas quando não há provedor configurado, por exemplo:

- DataJud
- ViaCEP
- BrasilAPI
- FIPE

### 3) Logs e erros

As rotas de consulta retornam erros com status HTTP claros:

- `400`: dados inválidos
- `404`: recurso não encontrado
- `503`: integração não configurada
- `502`: erro no provedor externo
- `500`: erro interno do sistema

## Checklist para ativar uma nova API

- [ ] Obter a URL do endpoint oficial
- [ ] Obter a chave ou credenciais do provedor
- [ ] Adicionar variáveis no `.env`
- [ ] Reiniciar o app
- [ ] Testar a rota `POST /api/gov-query`
- [ ] Validar resposta em JSON
- [ ] Ajustar a UI se os campos retornados forem diferentes

## Próximo passo recomendado

Se quiser, o ideal é configurar uma API por vez e validar a resposta no dashboard antes de habilitar a próxima. Isso reduz risco de falha e permite ajustar o tratamento dos dados conforme o retorno real do provedor.
