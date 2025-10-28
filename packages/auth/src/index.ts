/**
 * @lmring/auth - Authentication package
 * 
 * Better-Auth based authentication system for the monorepo.
 * Supports both SaaS (with OAuth) and self-hosted (Email/Password only) modes.
 */

// Export types
export type { AuthConfig, AuthUser, AuthSession } from './types';

// Export server-side authentication
export { createAuth } from './server';
export type { Auth, Session } from './server';

// Export client-side authentication
export { createClient } from './client';
export type { AuthClient } from './client';

// Export configuration
export { getAuthConfig } from './config';

// Export permissions and role utilities
export {
  UserRole,
  isAdmin,
  hasRole,
  requireAdmin,
  requireRole,
  canPerformAdminActions,
  getRoleDisplayName,
} from './permissions';
export type { UserRoleType } from './permissions';

// Export status utilities
export {
  UserStatus,
  isActive,
  isDisabled,
  isPending,
  hasStatus,
  requireActive,
  canSignIn,
  getStatusDisplayName,
  getStatusDescription,
} from './status';
export type { UserStatusType } from './status';

// Export error types and utilities
export {
  AuthError,
  AuthErrorCodes,
  createAuthError,
  isAuthError,
} from './errors';
export type { AuthErrorCode } from './errors';

// Export logger utilities
export {
  createAuthLogger,
  authLogger,
} from './logger';
export type { AuthLogger, LogContext } from './logger';

