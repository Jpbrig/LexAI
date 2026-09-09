/**
 * Utilitário centralizado de Audit Logging.
 * Todas as operações críticas (admin, deleção, convites, etc.)
 * devem chamar logAuditAction para criar um registro imutável.
 */

import { prisma } from "@/lib/prisma";
import type { AuthContext } from "@/lib/auth-guard";

export type AuditAction =
  // Auth
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  // Workspace / Tenant
  | "WORKSPACE_CREATED"
  | "WORKSPACE_UPDATED"
  | "WORKSPACE_SUSPENDED"
  | "WORKSPACE_ACTIVATED"
  | "WORKSPACE_DELETED"
  // Membros
  | "MEMBER_INVITED"
  | "MEMBER_ROLE_CHANGED"
  | "MEMBER_REMOVED"
  | "MEMBER_SUSPENDED"
  // Usuários
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_PASSWORD_CHANGED"
  // Permissões
  | "PERMISSIONS_CHANGED"
  // Assinatura
  | "SUBSCRIPTION_CHANGED"
  | "SUBSCRIPTION_CANCELLED"
  // Impersonation
  | "IMPERSONATION_STARTED"
  | "IMPERSONATION_ENDED"
  // Schema
  | "SCHEMA_MIGRATION";

export interface AuditPayload {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  // Contexto de quem executou — se disponível
  context?: Pick<AuthContext, "userId" | "workspaceId">;
  // Para ações de plataforma sem contexto de workspace
  userId?: string;
  workspaceId?: string;
  ipHash?: string;
}

/**
 * Registra uma entrada no audit log de forma assíncrona e non-blocking.
 * Erros de auditoria nunca devem derrubar a operação principal.
 */
export async function logAuditAction(payload: AuditPayload): Promise<void> {
  try {
    const userId = payload.context?.userId ?? payload.userId ?? null;
    const workspaceId =
      payload.context?.workspaceId ?? payload.workspaceId ?? null;

    await prisma.auditLog.create({
      data: {
        userId,
        workspaceId,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId ?? null,
        metadata: payload.metadata ? (payload.metadata as import("@prisma/client").Prisma.InputJsonValue) : undefined,
        ipHash: payload.ipHash ?? null,
      },
    });
  } catch (err) {
    // Nunca propagar erro de auditoria para não derrubar a operação principal
    console.error("[AuditLog] Falha ao registrar audit log:", err);
  }
}
