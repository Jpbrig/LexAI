# Estratégia de deploy do banco Supabase

## Fonte de verdade

- Schema: [`prisma/schema.prisma`](../prisma/schema.prisma)
- Migration baseline: [`prisma/migrations/20260901230917_baseline/migration.sql`](../prisma/migrations/20260901230917_baseline/migration.sql)
- Provedor: PostgreSQL do Supabase

A baseline representa o schema completo atual do LexAI. Ela é aplicável em um banco novo e não deve ser executada novamente no banco Supabase já sincronizado.

## Estado do banco atual

O banco remoto foi sincronizado previamente com `prisma db push` e estava sem registros nas tabelas legadas. A baseline deve ser registrada como aplicada usando `prisma migrate resolve`; isso cria o histórico `_prisma_migrations` sem recriar ou apagar tabelas.

## Fluxo recomendado de produção

1. Criar um backup ou confirmar que o Point-in-Time Recovery do projeto Supabase está disponível.
2. Configurar `DATABASE_URL` como secret do ambiente de deploy. Para migrations, usar uma conexão direta do Postgres; conexões pooler devem ser reservadas para o runtime quando necessário.
3. Instalar dependências com `npm ci`.
4. Gerar o cliente Prisma: `npm run db:generate`.
5. Aplicar migrations versionadas: `npm run db:migrate:deploy`.
6. Fazer o build da aplicação: `npm run build`.
7. Publicar a aplicação somente se a etapa de migration e o build forem concluídos.
8. Verificar `npm run db:migrate:status` e executar um health check da API após o deploy.

A migration deve ser executada antes de iniciar instâncias que dependam de campos ou tabelas novos. Em ambientes com múltiplas instâncias, apenas uma etapa de release deve executar `migrate deploy`; o comando é seguro para ser repetido depois que a migration estiver registrada.

## Bootstrap do banco atual

Executar uma única vez no banco Supabase que já recebeu o schema via `db push`:

```bash
npx prisma migrate resolve --applied 20260901230917_baseline
```

Depois conferir:

```bash
npm run db:migrate:status
```

Em um banco novo, não usar `migrate resolve`; executar `npm run db:migrate:deploy` para aplicar o SQL da baseline.

## Regras de segurança

- Não usar `prisma migrate reset` em produção.
- Não usar `prisma db push` como etapa normal de CI/CD.
- Toda alteração futura deve ser criada como uma nova migration, revisada no pull request e aplicada com `prisma migrate deploy`.
- Alterações potencialmente destrutivas devem ser precedidas por backup, consulta de compatibilidade e, quando necessário, uma migration expand/contract em etapas.
- Segredos (`.env`, `.env.local`, chaves de API e URLs com credenciais) nunca devem ser commitados; devem permanecer configurados no ambiente do provedor.
