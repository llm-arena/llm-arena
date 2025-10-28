/**
 * Better-Auth instance for the application
 */

import { createAuth } from '@lmring/auth';
import { getAuthBaseUrl } from '@/utils/Helpers';
import { Env } from './Env';
import { logger } from './Logger';

export const auth = createAuth({
  deploymentMode: Env.DEPLOYMENT_MODE,
  baseURL: getAuthBaseUrl(),
  secret: Env.BETTER_AUTH_SECRET,
  githubClientId: Env.GITHUB_CLIENT_ID,
  githubClientSecret: Env.GITHUB_CLIENT_SECRET,
  googleClientId: Env.GOOGLE_CLIENT_ID,
  googleClientSecret: Env.GOOGLE_CLIENT_SECRET,
  logger: {
    warn: (message: string, context?: Record<string, unknown>) => {
      logger.warn(message, context);
    },
    info: (message: string, context?: Record<string, unknown>) => {
      logger.info(message, context);
    },
    error: (message: string, context?: Record<string, unknown>) => {
      logger.error(message, context);
    },
    debug: (message: string, context?: Record<string, unknown>) => {
      logger.debug(message, context);
    },
  },
});

export type { Session } from '@lmring/auth';
