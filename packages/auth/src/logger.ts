/**
 * Structured logging utilities for authentication
 * 
 * Provides a consistent logging interface that ensures sensitive information
 * (passwords, tokens, secrets) is never logged.
 */

export interface LogContext {
  [key: string]: unknown;
}

export interface AuthLogger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
}

/**
 * Sensitive field names that should never be logged
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'accessToken',
  'refreshToken',
  'idToken',
  'clientSecret',
  'apiKey',
  'privateKey',
  'sessionToken',
  'authToken',
  'bearerToken',
]);

/**
 * Sanitizes log context by removing sensitive fields
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  const sanitized: LogContext = {};
  
  for (const [key, value] of Object.entries(context)) {
    // Check if the key is sensitive
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.has(key) || 
                       Array.from(SENSITIVE_FIELDS).some(field => 
                         lowerKey.includes(field.toLowerCase())
                       );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeContext(value as LogContext);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Creates a structured logger with automatic sanitization
 */
export function createAuthLogger(baseLogger?: AuthLogger, enableDebug = false): AuthLogger {
  // Default console logger if none provided
  const defaultLogger: AuthLogger = {
    info: (message: string, context?: LogContext) => {
      console.log(JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        ...sanitizeContext(context),
      }));
    },
    warn: (message: string, context?: LogContext) => {
      console.warn(JSON.stringify({
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        ...sanitizeContext(context),
      }));
    },
    error: (message: string, context?: LogContext) => {
      console.error(JSON.stringify({
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
        ...sanitizeContext(context),
      }));
    },
    debug: (message: string, context?: LogContext) => {
      // Only log debug messages if explicitly enabled
      if (enableDebug) {
        console.debug(JSON.stringify({
          level: 'debug',
          message,
          timestamp: new Date().toISOString(),
          ...sanitizeContext(context),
        }));
      }
    },
  };

  const logger = baseLogger || defaultLogger;

  // Wrap the logger to ensure all logs are sanitized
  return {
    info: (message: string, context?: LogContext) => {
      logger.info(message, sanitizeContext(context));
    },
    warn: (message: string, context?: LogContext) => {
      logger.warn(message, sanitizeContext(context));
    },
    error: (message: string, context?: LogContext) => {
      logger.error(message, sanitizeContext(context));
    },
    debug: (message: string, context?: LogContext) => {
      logger.debug(message, sanitizeContext(context));
    },
  };
}

/**
 * Default auth logger instance
 */
export const authLogger = createAuthLogger();
