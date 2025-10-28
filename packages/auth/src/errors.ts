/**
 * Authentication error types and codes
 */

/**
 * Authentication error codes
 */
export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_DISABLED: 'USER_DISABLED',
  USER_PENDING: 'USER_PENDING',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  OAUTH_ERROR: 'OAUTH_ERROR',
  ACCOUNT_LINKING_FAILED: 'ACCOUNT_LINKING_FAILED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG: 'PASSWORD_TOO_LONG',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

/**
 * Custom error class for authentication-related errors
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AuthError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ('captureStackTrace' in Error) {
      (Error as any).captureStackTrace(this, AuthError);
    }
  }
}

/**
 * Helper function to create an AuthError with a specific code
 */
export function createAuthError(
  code: AuthErrorCode,
  message?: string,
  statusCode?: number,
): AuthError {
  const defaultMessages: Record<AuthErrorCode, string> = {
    [AuthErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password',
    [AuthErrorCodes.USER_DISABLED]: 'Your account has been disabled. Please contact support.',
    [AuthErrorCodes.USER_PENDING]: 'Your account is pending activation. Please check your email.',
    [AuthErrorCodes.EMAIL_NOT_VERIFIED]: 'Please verify your email address before signing in',
    [AuthErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
    [AuthErrorCodes.OAUTH_ERROR]: 'OAuth authentication failed. Please try again.',
    [AuthErrorCodes.ACCOUNT_LINKING_FAILED]: 'Failed to link account. Please try again.',
    [AuthErrorCodes.INVALID_TOKEN]: 'Invalid or expired token',
    [AuthErrorCodes.MISSING_CREDENTIALS]: 'Email and password are required',
    [AuthErrorCodes.PASSWORD_TOO_SHORT]: 'Password must be at least 8 characters long',
    [AuthErrorCodes.PASSWORD_TOO_LONG]: 'Password must be less than 128 characters long',
    [AuthErrorCodes.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists',
    [AuthErrorCodes.CONFIGURATION_ERROR]: 'Authentication configuration error',
  };

  const defaultStatusCodes: Record<AuthErrorCode, number> = {
    [AuthErrorCodes.INVALID_CREDENTIALS]: 401,
    [AuthErrorCodes.USER_DISABLED]: 403,
    [AuthErrorCodes.USER_PENDING]: 403,
    [AuthErrorCodes.EMAIL_NOT_VERIFIED]: 403,
    [AuthErrorCodes.SESSION_EXPIRED]: 401,
    [AuthErrorCodes.OAUTH_ERROR]: 400,
    [AuthErrorCodes.ACCOUNT_LINKING_FAILED]: 400,
    [AuthErrorCodes.INVALID_TOKEN]: 401,
    [AuthErrorCodes.MISSING_CREDENTIALS]: 400,
    [AuthErrorCodes.PASSWORD_TOO_SHORT]: 400,
    [AuthErrorCodes.PASSWORD_TOO_LONG]: 400,
    [AuthErrorCodes.EMAIL_ALREADY_EXISTS]: 409,
    [AuthErrorCodes.CONFIGURATION_ERROR]: 500,
  };

  return new AuthError(
    message || defaultMessages[code],
    code,
    statusCode || defaultStatusCodes[code],
  );
}

/**
 * Type guard to check if an error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
