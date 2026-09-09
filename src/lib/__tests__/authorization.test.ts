import { expect, test, describe } from 'vitest';
import { hasMinimumRole, canMutate, canManageWorkspace } from '../authorization';
import type { AuthContext } from '../auth-guard';

describe('Authorization Rules', () => {
  const getContext = (role: 'READ_ONLY' | 'MEMBER' | 'ADMIN' | 'OWNER'): AuthContext => ({
    userId: '1',
    workspaceId: '1',
    sessionId: '1',
    role,
    isPlatformAdmin: false,
  });

  describe('hasMinimumRole', () => {
    test('OWNER passes for all', () => {
      const ctx = getContext('OWNER');
      expect(hasMinimumRole(ctx, 'READ_ONLY')).toBe(true);
      expect(hasMinimumRole(ctx, 'MEMBER')).toBe(true);
      expect(hasMinimumRole(ctx, 'ADMIN')).toBe(true);
      expect(hasMinimumRole(ctx, 'OWNER')).toBe(true);
    });

    test('READ_ONLY fails for higher roles', () => {
      const ctx = getContext('READ_ONLY');
      expect(hasMinimumRole(ctx, 'READ_ONLY')).toBe(true);
      expect(hasMinimumRole(ctx, 'MEMBER')).toBe(false);
      expect(hasMinimumRole(ctx, 'ADMIN')).toBe(false);
      expect(hasMinimumRole(ctx, 'OWNER')).toBe(false);
    });
  });

  describe('canMutate', () => {
    test('allows MEMBER, ADMIN, OWNER', () => {
      expect(canMutate(getContext('MEMBER'))).toBe(true);
      expect(canMutate(getContext('ADMIN'))).toBe(true);
      expect(canMutate(getContext('OWNER'))).toBe(true);
    });

    test('denies READ_ONLY', () => {
      expect(canMutate(getContext('READ_ONLY'))).toBe(false);
    });
  });

  describe('canManageWorkspace', () => {
    test('allows ADMIN, OWNER', () => {
      expect(canManageWorkspace(getContext('ADMIN'))).toBe(true);
      expect(canManageWorkspace(getContext('OWNER'))).toBe(true);
    });

    test('denies READ_ONLY, MEMBER', () => {
      expect(canManageWorkspace(getContext('READ_ONLY'))).toBe(false);
      expect(canManageWorkspace(getContext('MEMBER'))).toBe(false);
    });
  });
});
