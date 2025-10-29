import { env } from '@lmring/env';
import { routing } from '@lmring/i18n';

/**
 * Get the base URL for the application
 * This function provides a consistent baseURL across server and client
 * to prevent OAuth callback mismatches.
 *
 * Priority order:
 * 1. BETTER_AUTH_URL (if set, for custom auth domains)
 * 2. NEXT_PUBLIC_APP_URL (explicit app URL)
 * 3. VERCEL_PROJECT_PRODUCTION_URL (Vercel production)
 * 4. VERCEL_URL (Vercel preview/development)
 * 5. localhost:3000 (local development)
 */
export const getBaseUrl = () => {
  // Server-side only: Check BETTER_AUTH_URL first
  if (typeof window === 'undefined' && env.BETTER_AUTH_URL) {
    return env.BETTER_AUTH_URL;
  }

  // Check explicit app URL (available on both client and server)
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  // Vercel-specific URLs (server-side only)
  if (typeof window === 'undefined') {
    if (env.VERCEL_ENV === 'production' && env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    if (env.VERCEL_URL) {
      return `https://${env.VERCEL_URL}`;
    }
  }

  return 'http://localhost:3000';
};

/**
 * Get the auth base URL specifically for Better Auth
 * This ensures consistent URL resolution between Auth server and client
 *
 * IMPORTANT: If you set BETTER_AUTH_URL, make sure NEXT_PUBLIC_APP_URL
 * points to the same URL to prevent OAuth callback mismatches.
 * The client can only access NEXT_PUBLIC_APP_URL, while the server
 * can access both BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL.
 */
export const getAuthBaseUrl = () => {
  const baseUrl = getBaseUrl();

  // Validate consistency between BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL
  if (
    typeof window === 'undefined' &&
    env.BETTER_AUTH_URL &&
    env.NEXT_PUBLIC_APP_URL &&
    env.BETTER_AUTH_URL !== env.NEXT_PUBLIC_APP_URL
  ) {
    console.warn(
      `[Auth Config Warning] BETTER_AUTH_URL (${env.BETTER_AUTH_URL}) and NEXT_PUBLIC_APP_URL (${env.NEXT_PUBLIC_APP_URL}) are different. ` +
        'This may cause OAuth callback mismatches. ' +
        'Ensure both variables point to the same publicly accessible URL.',
    );
  }

  return baseUrl;
};

export const getI18nPath = (url: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

export const isServer = () => {
  return typeof window === 'undefined';
};
