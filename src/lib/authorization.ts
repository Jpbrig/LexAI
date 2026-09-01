import type { AuthContext, WorkspaceRole } from "@/lib/auth-guard";

const roleRank: Record<WorkspaceRole, number> = {
  READ_ONLY: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasMinimumRole(context: AuthContext, minimumRole: WorkspaceRole) {
  return roleRank[context.role] >= roleRank[minimumRole];
}

export function canMutate(context: AuthContext) {
  return hasMinimumRole(context, "MEMBER");
}

export function canManageWorkspace(context: AuthContext) {
  return hasMinimumRole(context, "ADMIN");
}
