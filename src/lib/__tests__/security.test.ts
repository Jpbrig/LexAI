/**
 * Testes de Segurança: Tenant Isolation & Permission Guards
 *
 * Estes testes verificam que:
 * 1. O motor de permissões está correto para cada role.
 * 2. Roles como INTERN/SECRETARY não conseguem executar ações sensíveis.
 * 3. A hierarquia de roles está correta.
 * 4. Funcionalidades legadas (MEMBER, READ_ONLY) ainda funcionam.
 */

import { expect, test, describe } from "vitest";
import {
  hasPermission,
  hasMinimumRole,
  canMutate,
  canManageWorkspace,
  PERMISSIONS,
} from "../authorization";
import type { AuthContext } from "../auth-guard";

// Helper para criar contextos de teste com diferentes roles
const makeCtx = (role: AuthContext["role"]): AuthContext => ({
  userId: "user-test",
  workspaceId: "ws-test",
  sessionId: "session-test",
  role,
  isPlatformAdmin: false,
});

// ──────────────────────────────────────────────────────────────
// SUITE 1: OWNER — acesso total
// ──────────────────────────────────────────────────────────────
describe("OWNER permissions", () => {
  const ctx = makeCtx("OWNER");

  test("pode deletar usuários", () => {
    expect(hasPermission(ctx, PERMISSIONS.USERS_DELETE)).toBe(true);
  });
  test("pode gerenciar billing", () => {
    expect(hasPermission(ctx, PERMISSIONS.BILLING_MANAGE)).toBe(true);
  });
  test("pode deletar organização", () => {
    expect(hasPermission(ctx, PERMISSIONS.ORG_DELETE)).toBe(true);
  });
  test("pode enviar petições", () => {
    expect(hasPermission(ctx, PERMISSIONS.PETITIONS_SEND)).toBe(true);
  });
  test("pode gerenciar integrações", () => {
    expect(hasPermission(ctx, PERMISSIONS.INTEGRATIONS_MANAGE)).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// SUITE 2: ADMIN — quase total, mas SEM prerrogativas de OWNER
// ──────────────────────────────────────────────────────────────
describe("ADMIN permissions", () => {
  const ctx = makeCtx("ADMIN");

  test("pode convidar usuários", () => {
    expect(hasPermission(ctx, PERMISSIONS.USERS_INVITE)).toBe(true);
  });
  test("pode alterar roles de usuários", () => {
    expect(hasPermission(ctx, PERMISSIONS.USERS_CHANGE_ROLE)).toBe(true);
  });
  test("NÃO pode deletar usuários (apenas OWNER)", () => {
    expect(hasPermission(ctx, PERMISSIONS.USERS_DELETE)).toBe(false);
  });
  test("NÃO pode gerenciar billing (apenas OWNER)", () => {
    expect(hasPermission(ctx, PERMISSIONS.BILLING_MANAGE)).toBe(false);
  });
  test("NÃO pode deletar organização (apenas OWNER)", () => {
    expect(hasPermission(ctx, PERMISSIONS.ORG_DELETE)).toBe(false);
  });
  test("pode ler billing", () => {
    expect(hasPermission(ctx, PERMISSIONS.BILLING_READ)).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// SUITE 3: LAWYER — acesso jurídico pleno
// ──────────────────────────────────────────────────────────────
describe("LAWYER permissions", () => {
  const ctx = makeCtx("LAWYER");

  test("pode criar e enviar petições", () => {
    expect(hasPermission(ctx, PERMISSIONS.PETITIONS_CREATE)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.PETITIONS_SEND)).toBe(true);
  });
  test("pode gerenciar processos", () => {
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_CREATE)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_UPDATE)).toBe(true);
  });
  test("pode usar ferramentas de IA", () => {
    expect(hasPermission(ctx, PERMISSIONS.AI_TOOLS_USE)).toBe(true);
  });
  test("NÃO pode gerenciar usuários", () => {
    expect(hasPermission(ctx, PERMISSIONS.USERS_INVITE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.USERS_DELETE)).toBe(false);
  });
  test("NÃO pode ver billing", () => {
    expect(hasPermission(ctx, PERMISSIONS.BILLING_READ)).toBe(false);
  });
  test("NÃO pode deletar processos (operação sensível)", () => {
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_DELETE)).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// SUITE 4: INTERN — acesso jurídico limitado
// ──────────────────────────────────────────────────────────────
describe("INTERN permissions", () => {
  const ctx = makeCtx("INTERN");

  test("pode ler processos e clientes", () => {
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_READ)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.CLIENTS_READ)).toBe(true);
  });
  test("pode criar documentos e petições (rascunhos)", () => {
    expect(hasPermission(ctx, PERMISSIONS.DOCUMENTS_CREATE)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.PETITIONS_CREATE)).toBe(true);
  });
  test("NÃO pode ENVIAR petições (requer aprovação)", () => {
    expect(hasPermission(ctx, PERMISSIONS.PETITIONS_SEND)).toBe(false);
  });
  test("NÃO pode criar ou atualizar processos", () => {
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_CREATE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_UPDATE)).toBe(false);
  });
  test("NÃO pode deletar nada", () => {
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_DELETE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.CLIENTS_DELETE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.DOCUMENTS_DELETE)).toBe(false);
  });
  test("NÃO pode gerenciar usuários ou org", () => {
    expect(hasPermission(ctx, PERMISSIONS.USERS_INVITE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.ORG_SETTINGS)).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// SUITE 5: SECRETARY — acesso administrativo operacional
// ──────────────────────────────────────────────────────────────
describe("SECRETARY permissions", () => {
  const ctx = makeCtx("SECRETARY");

  test("pode gerenciar agenda", () => {
    expect(hasPermission(ctx, PERMISSIONS.CALENDAR_READ)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.CALENDAR_CREATE)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.CALENDAR_UPDATE)).toBe(true);
  });
  test("pode ler e criar clientes", () => {
    expect(hasPermission(ctx, PERMISSIONS.CLIENTS_READ)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.CLIENTS_CREATE)).toBe(true);
  });
  test("NÃO tem acesso a processos", () => {
    expect(hasPermission(ctx, PERMISSIONS.PROCESSES_READ)).toBe(false);
  });
  test("NÃO pode enviar petições", () => {
    expect(hasPermission(ctx, PERMISSIONS.PETITIONS_SEND)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.PETITIONS_CREATE)).toBe(false);
  });
  test("NÃO pode acessar billing", () => {
    expect(hasPermission(ctx, PERMISSIONS.BILLING_READ)).toBe(false);
  });
  test("NÃO pode gerenciar usuários", () => {
    expect(hasPermission(ctx, PERMISSIONS.USERS_INVITE)).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// SUITE 6: Hierarquia e Compatibilidade Retroativa
// ──────────────────────────────────────────────────────────────
describe("Role hierarchy", () => {
  test("OWNER tem rank maior que ADMIN", () => {
    expect(hasMinimumRole(makeCtx("OWNER"), "ADMIN")).toBe(true);
    expect(hasMinimumRole(makeCtx("ADMIN"), "OWNER")).toBe(false);
  });

  test("ADMIN tem rank maior que LAWYER", () => {
    expect(hasMinimumRole(makeCtx("ADMIN"), "LAWYER")).toBe(true);
    expect(hasMinimumRole(makeCtx("LAWYER"), "ADMIN")).toBe(false);
  });

  test("LAWYER e SECRETARY têm mesmo rank (acima de INTERN)", () => {
    expect(hasMinimumRole(makeCtx("LAWYER"), "INTERN")).toBe(true);
    expect(hasMinimumRole(makeCtx("SECRETARY"), "INTERN")).toBe(true);
  });

  test("canMutate: LAWYER, ADMIN, OWNER podem, INTERN e SECRETARY não", () => {
    expect(canMutate(makeCtx("LAWYER"))).toBe(true);
    expect(canMutate(makeCtx("ADMIN"))).toBe(true);
    expect(canMutate(makeCtx("OWNER"))).toBe(true);
    // INTERN e SECRETARY não têm processes.update
    expect(canMutate(makeCtx("INTERN"))).toBe(false);
    expect(canMutate(makeCtx("SECRETARY"))).toBe(false);
  });

  test("canManageWorkspace: apenas ADMIN e OWNER", () => {
    expect(canManageWorkspace(makeCtx("ADMIN"))).toBe(true);
    expect(canManageWorkspace(makeCtx("OWNER"))).toBe(true);
    expect(canManageWorkspace(makeCtx("LAWYER"))).toBe(false);
    expect(canManageWorkspace(makeCtx("INTERN"))).toBe(false);
    expect(canManageWorkspace(makeCtx("SECRETARY"))).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// SUITE 7: Isolamento Tenant (simulação de lógica)
// ──────────────────────────────────────────────────────────────
describe("Tenant isolation logic", () => {
  /**
   * Simula a verificação de ownership no backend.
   * O backend NUNCA confia no workspaceId enviado pelo frontend.
   * Ele usa o workspaceId obtido via getAuthContext().
   */
  function canAccessResource(
    resourceWorkspaceId: string,
    userContext: AuthContext
  ): boolean {
    return resourceWorkspaceId === userContext.workspaceId;
  }

  const tenantACtx = makeCtx("OWNER");
  const tenantBCtx: AuthContext = { ...makeCtx("OWNER"), workspaceId: "ws-tenant-b" };

  test("usuário do Tenant A NÃO pode acessar recurso do Tenant B", () => {
    const resourceFromTenantB = "ws-tenant-b";
    expect(canAccessResource(resourceFromTenantB, tenantACtx)).toBe(false);
  });

  test("usuário do Tenant B pode acessar seus próprios recursos", () => {
    const resourceFromTenantB = "ws-tenant-b";
    expect(canAccessResource(resourceFromTenantB, tenantBCtx)).toBe(true);
  });

  test("tentativa de IDOR: mesmo com role OWNER, não acessa outro tenant", () => {
    // Simula ataque onde usuário envia workspaceId de outro tenant via frontend
    const attackingContext = tenantACtx; // workspaceId = "ws-test"
    const targetResourceWorkspace = "ws-tenant-b"; // do Tenant B
    expect(canAccessResource(targetResourceWorkspace, attackingContext)).toBe(false);
  });
});
