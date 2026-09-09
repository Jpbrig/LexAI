-- Migration: add_lawyer_intern_secretary_roles
-- Descrição: Expande o enum WorkspaceRole com papéis semânticos para
-- escritórios de advocacia. MEMBER -> LAWYER e READ_ONLY -> INTERN
-- são mapeamentos de dados seguros executados logo abaixo.

-- Passo 1: Adicionar os novos valores ao enum (não destrutivo)
ALTER TYPE "WorkspaceRole" ADD VALUE IF NOT EXISTS 'LAWYER';
ALTER TYPE "WorkspaceRole" ADD VALUE IF NOT EXISTS 'INTERN';
ALTER TYPE "WorkspaceRole" ADD VALUE IF NOT EXISTS 'SECRETARY';

-- Passo 2: Migrar dados existentes
-- MEMBER -> LAWYER (Advogado Associado tem mais semântica que "Membro")
UPDATE "Membership" SET role = 'LAWYER' WHERE role = 'MEMBER';

-- READ_ONLY -> INTERN (papel mais próximo em termos de permissões)
UPDATE "Membership" SET role = 'INTERN' WHERE role = 'READ_ONLY';

-- Passo 3: Criar Audit Log desta migration
INSERT INTO "AuditLog" (id, action, resource, metadata, "createdAt")
VALUES (
  gen_random_uuid()::text,
  'SCHEMA_MIGRATION',
  'Membership',
  '{"migration": "add_lawyer_intern_secretary_roles", "changes": ["MEMBER -> LAWYER", "READ_ONLY -> INTERN"]}'::jsonb,
  NOW()
);
