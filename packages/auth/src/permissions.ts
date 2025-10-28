/**
 * User role and permission utilities
 */

import type { AuthUser } from './types';

/**
 * User roles
 */
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

/**
 * Check if a user has admin role
 */
export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: AuthUser | null | undefined, role: UserRoleType): boolean {
  return user?.role === role;
}

/**
 * Require admin role - throws error if user is not admin
 */
export function requireAdmin(user: AuthUser | null | undefined): asserts user is AuthUser {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (!isAdmin(user)) {
    throw new Error('Admin privileges required');
  }
}

/**
 * Require specific role - throws error if user doesn't have the role
 */
export function requireRole(
  user: AuthUser | null | undefined,
  role: UserRoleType,
): asserts user is AuthUser {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (!hasRole(user, role)) {
    throw new Error(`Role '${role}' required`);
  }
}

/**
 * Check if user can perform admin actions
 */
export function canPerformAdminActions(user: AuthUser | null | undefined): boolean {
  return isAdmin(user);
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRoleType): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.USER:
      return 'User';
    default:
      return 'Unknown';
  }
}
