/**
 * User status utilities
 */

import type { AuthUser } from './types';

/**
 * User status values
 */
export const UserStatus = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  PENDING: 'pending',
} as const;

export type UserStatusType = typeof UserStatus[keyof typeof UserStatus];

/**
 * Check if a user is active
 */
export function isActive(user: AuthUser | null | undefined): boolean {
  return user?.status === UserStatus.ACTIVE;
}

/**
 * Check if a user is disabled
 */
export function isDisabled(user: AuthUser | null | undefined): boolean {
  return user?.status === UserStatus.DISABLED;
}

/**
 * Check if a user is pending
 */
export function isPending(user: AuthUser | null | undefined): boolean {
  return user?.status === UserStatus.PENDING;
}

/**
 * Check if a user has a specific status
 */
export function hasStatus(user: AuthUser | null | undefined, status: UserStatusType): boolean {
  return user?.status === status;
}

/**
 * Require active status - throws error if user is not active
 */
export function requireActive(user: AuthUser | null | undefined): asserts user is AuthUser {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (isDisabled(user)) {
    throw new Error('Account is disabled');
  }
  if (isPending(user)) {
    throw new Error('Account is pending activation');
  }
  if (!isActive(user)) {
    throw new Error('Account is not active');
  }
}

/**
 * Check if user can sign in based on status
 */
export function canSignIn(user: AuthUser | null | undefined): boolean {
  return isActive(user);
}

/**
 * Get user status display name
 */
export function getStatusDisplayName(status: UserStatusType): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'Active';
    case UserStatus.DISABLED:
      return 'Disabled';
    case UserStatus.PENDING:
      return 'Pending';
    default:
      return 'Unknown';
  }
}

/**
 * Get user status description
 */
export function getStatusDescription(status: UserStatusType): string {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'Account is active and can access all features';
    case UserStatus.DISABLED:
      return 'Account has been disabled and cannot sign in';
    case UserStatus.PENDING:
      return 'Account is pending activation';
    default:
      return 'Unknown status';
  }
}
