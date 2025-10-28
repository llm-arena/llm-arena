/**
 * Better-Auth configuration generator
 */

import type { AuthLogger } from './logger';
import { authLogger as defaultLogger } from './logger';

interface ConfigOptions {
  deploymentMode: 'saas' | 'selfhost';
  baseURL: string;
  secret: string;
  githubClientId?: string;
  githubClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  logger?: AuthLogger;
}

export function getAuthConfig(options: ConfigOptions) {
  const {
    deploymentMode,
    baseURL,
    secret,
    githubClientId,
    githubClientSecret,
    googleClientId,
    googleClientSecret,
    logger = defaultLogger,
  } = options;

  if (!secret) {
    const error = new Error('BETTER_AUTH_SECRET is required');
    logger.error('Configuration error: Missing BETTER_AUTH_SECRET', {
      error: error.message,
    });
    throw error;
  }

  if (secret.length < 32) {
    const error = new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
    logger.error('Configuration error: BETTER_AUTH_SECRET too short', {
      error: error.message,
      secretLength: secret.length,
      requiredLength: 32,
    });
    throw error;
  }

  const config: any = {
    appName: 'LMRing',
    baseURL,
    secret,
  };

  // Log deployment mode
  logger.info('Better-Auth configuration loaded', {
    deploymentMode,
    baseURL,
    appName: config.appName,
  });

  // OAuth providers only in SaaS mode
  if (deploymentMode === 'saas') {
    logger.info('SaaS mode enabled - configuring OAuth providers');
    
    const socialProviders: any = {};
    const enabledProviders: string[] = [];
    const missingProviders: string[] = [];

    // GitHub OAuth
    if (githubClientId && githubClientSecret) {
      socialProviders.github = {
        clientId: githubClientId,
        clientSecret: githubClientSecret,
      };
      enabledProviders.push('GitHub');
      logger.info('GitHub OAuth enabled', {
        provider: 'github',
        hasClientId: !!githubClientId,
        hasClientSecret: !!githubClientSecret,
      });
    } else {
      missingProviders.push('GitHub');
      logger.warn('GitHub OAuth credentials not configured - GitHub login will be unavailable', {
        provider: 'github',
        hasClientId: !!githubClientId,
        hasClientSecret: !!githubClientSecret,
        missingFields: [
          !githubClientId && 'GITHUB_CLIENT_ID',
          !githubClientSecret && 'GITHUB_CLIENT_SECRET',
        ].filter(Boolean),
      });
    }

    // Google OAuth
    if (googleClientId && googleClientSecret) {
      socialProviders.google = {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        accessType: 'offline',
      };
      enabledProviders.push('Google');
      logger.info('Google OAuth enabled', {
        provider: 'google',
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
        accessType: 'offline',
      });
    } else {
      missingProviders.push('Google');
      logger.warn('Google OAuth credentials not configured - Google login will be unavailable', {
        provider: 'google',
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
        missingFields: [
          !googleClientId && 'GOOGLE_CLIENT_ID',
          !googleClientSecret && 'GOOGLE_CLIENT_SECRET',
        ].filter(Boolean),
      });
    }

    if (Object.keys(socialProviders).length > 0) {
      config.socialProviders = socialProviders;
      logger.info('OAuth providers configured', {
        enabledProviders,
        providerCount: enabledProviders.length,
      });
    } else {
      logger.warn('No OAuth providers configured in SaaS mode', {
        missingProviders,
        recommendation: 'Configure at least one OAuth provider for better user experience',
      });
    }
  } else {
    logger.info('Self-hosted mode enabled - OAuth providers disabled', {
      deploymentMode,
      availableAuthMethods: ['Email/Password'],
    });
  }

  logger.debug('Final auth configuration', {
    hasDatabase: !!config.database,
    hasSocialProviders: !!config.socialProviders,
    socialProviderCount: config.socialProviders ? Object.keys(config.socialProviders).length : 0,
  });

  return config;
}
