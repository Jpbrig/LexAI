/**
 * Sistema de Permissões Granulares do LexAI
 *
 * Cada WorkspaceRole mapeia para um conjunto de permissões funcionais.
 * Isso evita `if role === 'ADMIN'` espalhado pelo código — toda checagem
 * de acesso deve passar pela função `hasPermission(context, permission)`.
 *
 * Para roles customizadas futuras, o campo `customPermissions` no Membership
 * poderá sobrescrever ou estender esse mapeamento.
 */

import type { AuthContext, WorkspaceRole } from "@/lib/auth-guard";

// ──────────────────────────────────────────────
// 1. CATÁLOGO DE PERMISSÕES
// ──────────────────────────────────────────────
export const PERMISSIONS = {
  // Usuários
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_CHANGE_ROLE: "users.change_role",
  USERS_INVITE: "users.invite",

  // Organização / Workspace
  ORG_READ: "organization.read",
  ORG_UPDATE: "organization.update",
  ORG_DELETE: "organization.delete",
  ORG_SETTINGS: "organization.settings",

  // Clientes
  CLIENTS_READ: "clients.read",
  CLIENTS_CREATE: "clients.create",
  CLIENTS_UPDATE: "clients.update",
  CLIENTS_DELETE: "clients.delete",

  // Processos
  PROCESSES_READ: "processes.read",
  PROCESSES_CREATE: "processes.create",
  PROCESSES_UPDATE: "processes.update",
  PROCESSES_DELETE: "processes.delete",

  // Documentos
  DOCUMENTS_READ: "documents.read",
  DOCUMENTS_CREATE: "documents.create",
  DOCUMENTS_UPDATE: "documents.update",
  DOCUMENTS_DELETE: "documents.delete",

  // Petições
  PETITIONS_READ: "petitions.read",
  PETITIONS_CREATE: "petitions.create",
  PETITIONS_UPDATE: "petitions.update",
  PETITIONS_SEND: "petitions.send",

  // Agenda
  CALENDAR_READ: "calendar.read",
  CALENDAR_CREATE: "calendar.create",
  CALENDAR_UPDATE: "calendar.update",
  CALENDAR_DELETE: "calendar.delete",

  // Financeiro & Assinatura
  BILLING_READ: "billing.read",
  BILLING_MANAGE: "billing.manage",

  // Ferramentas de IA
  AI_TOOLS_USE: "ai_tools.use",

  // Integrações
  INTEGRATIONS_READ: "integrations.read",
  INTEGRATIONS_MANAGE: "integrations.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ──────────────────────────────────────────────
// 2. MAPEAMENTO ROLE → PERMISSÕES
// ──────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  OWNER: [
    // Todos os recursos
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_CHANGE_ROLE,
    PERMISSIONS.USERS_INVITE,

    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ORG_DELETE,
    PERMISSIONS.ORG_SETTINGS,

    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,
    PERMISSIONS.CLIENTS_DELETE,

    PERMISSIONS.PROCESSES_READ,
    PERMISSIONS.PROCESSES_CREATE,
    PERMISSIONS.PROCESSES_UPDATE,
    PERMISSIONS.PROCESSES_DELETE,

    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_CREATE,
    PERMISSIONS.DOCUMENTS_UPDATE,
    PERMISSIONS.DOCUMENTS_DELETE,

    PERMISSIONS.PETITIONS_READ,
    PERMISSIONS.PETITIONS_CREATE,
    PERMISSIONS.PETITIONS_UPDATE,
    PERMISSIONS.PETITIONS_SEND,

    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_UPDATE,
    PERMISSIONS.CALENDAR_DELETE,

    PERMISSIONS.BILLING_READ,
    PERMISSIONS.BILLING_MANAGE,

    PERMISSIONS.AI_TOOLS_USE,
    PERMISSIONS.INTEGRATIONS_READ,
    PERMISSIONS.INTEGRATIONS_MANAGE,
  ],

  ADMIN: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.USERS_CHANGE_ROLE,
    // Não pode deletar usuários sem ser OWNER

    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ORG_SETTINGS,
    // Não pode deletar a organização

    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,
    PERMISSIONS.CLIENTS_DELETE,

    PERMISSIONS.PROCESSES_READ,
    PERMISSIONS.PROCESSES_CREATE,
    PERMISSIONS.PROCESSES_UPDATE,
    PERMISSIONS.PROCESSES_DELETE,

    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_CREATE,
    PERMISSIONS.DOCUMENTS_UPDATE,
    PERMISSIONS.DOCUMENTS_DELETE,

    PERMISSIONS.PETITIONS_READ,
    PERMISSIONS.PETITIONS_CREATE,
    PERMISSIONS.PETITIONS_UPDATE,
    PERMISSIONS.PETITIONS_SEND,

    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_UPDATE,
    PERMISSIONS.CALENDAR_DELETE,

    PERMISSIONS.BILLING_READ,
    // Não pode gerenciar billing — é prerrogativa do OWNER

    PERMISSIONS.AI_TOOLS_USE,
    PERMISSIONS.INTEGRATIONS_READ,
    PERMISSIONS.INTEGRATIONS_MANAGE,
  ],

  LAWYER: [
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,

    PERMISSIONS.PROCESSES_READ,
    PERMISSIONS.PROCESSES_CREATE,
    PERMISSIONS.PROCESSES_UPDATE,

    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_CREATE,
    PERMISSIONS.DOCUMENTS_UPDATE,

    PERMISSIONS.PETITIONS_READ,
    PERMISSIONS.PETITIONS_CREATE,
    PERMISSIONS.PETITIONS_UPDATE,
    PERMISSIONS.PETITIONS_SEND,

    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_UPDATE,
    PERMISSIONS.CALENDAR_DELETE,

    PERMISSIONS.AI_TOOLS_USE,
  ],

  INTERN: [
    PERMISSIONS.CLIENTS_READ,

    PERMISSIONS.PROCESSES_READ,

    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_CREATE,

    PERMISSIONS.PETITIONS_READ,
    PERMISSIONS.PETITIONS_CREATE,
    // Não pode enviar petições (requer aprovação)

    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_CREATE,

    PERMISSIONS.AI_TOOLS_USE,
  ],

  SECRETARY: [
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,

    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_UPDATE,
    PERMISSIONS.CALENDAR_DELETE,

    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_CREATE,

    // Sem acesso a processos sensíveis, petições ou financeiro
  ],

  // Legados — mantidos por retrocompatibilidade até a migration ser aplicada em prod
  MEMBER: [
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_UPDATE,
    PERMISSIONS.PROCESSES_READ,
    PERMISSIONS.PROCESSES_CREATE,
    PERMISSIONS.PROCESSES_UPDATE,
    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.DOCUMENTS_CREATE,
    PERMISSIONS.PETITIONS_READ,
    PERMISSIONS.PETITIONS_CREATE,
    PERMISSIONS.PETITIONS_SEND,
    PERMISSIONS.CALENDAR_READ,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_UPDATE,
    PERMISSIONS.CALENDAR_DELETE,
    PERMISSIONS.AI_TOOLS_USE,
  ],

  READ_ONLY: [
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.PROCESSES_READ,
    PERMISSIONS.DOCUMENTS_READ,
    PERMISSIONS.PETITIONS_READ,
    PERMISSIONS.CALENDAR_READ,
  ],
};

// ──────────────────────────────────────────────
// 3. FUNÇÕES PÚBLICAS DE AUTORIZAÇÃO
// ──────────────────────────────────────────────

/**
 * Verifica se o contexto autenticado possui uma permissão específica.
 * NUNCA confiar em permissões vindas do frontend.
 */
export function hasPermission(
  context: AuthContext,
  permission: Permission
): boolean {
  const allowed = ROLE_PERMISSIONS[context.role] ?? [];
  return allowed.includes(permission);
}

/**
 * Retorna todas as permissões de um contexto (útil para debug/auditoria).
 */
export function getPermissions(context: AuthContext): Permission[] {
  return ROLE_PERMISSIONS[context.role] ?? [];
}

// ──────────────────────────────────────────────
// 4. HELPERS RETROCOMPATÍVEIS (mantidos para não quebrar código existente)
// ──────────────────────────────────────────────

const roleRank: Record<WorkspaceRole, number> = {
  READ_ONLY: 0,
  INTERN: 1,
  SECRETARY: 1,
  MEMBER: 2,
  LAWYER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function hasMinimumRole(
  context: AuthContext,
  minimumRole: WorkspaceRole
): boolean {
  return roleRank[context.role] >= roleRank[minimumRole];
}

export function canMutate(context: AuthContext): boolean {
  return hasPermission(context, PERMISSIONS.PROCESSES_UPDATE);
}

export function canManageWorkspace(context: AuthContext): boolean {
  return hasPermission(context, PERMISSIONS.ORG_SETTINGS);
}
