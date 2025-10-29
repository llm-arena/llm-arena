import { detectBot } from '@arcjet/next';
import type { AuthUser } from '@lmring/auth';
import { isDisabled, isPending, UserStatus } from '@lmring/auth';
import { routing } from '@lmring/i18n';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import arcjet from '@/libs/Arcjet';
import { auth } from '@/libs/Auth';
import { logger } from '@/libs/Logger';

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_PATHS = ['/dashboard'];
const AUTH_PATHS = ['/sign-in', '/sign-up'];
const ACCOUNT_DISABLED_PATH = '/account-disabled';
const LOCALE_PREFIX_REGEX = /^\/[a-z]{2}(\/|$)/;

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX_REGEX, '/');
}

function matchesAnyPath(pathname: string, paths: string[]): boolean {
  const normalizedPath = stripLocalePrefix(pathname);
  return paths.some((path) => normalizedPath.startsWith(path));
}

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function middleware(request: NextRequest, _event: NextFetchEvent) {
  // Verify the request with Arcjet
  // Use process.env instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { pathname } = request.nextUrl;
  const locale = pathname.match(LOCALE_PREFIX_REGEX)?.[0]?.replace(/\//g, '') ?? '';

  // Get session from Better-Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const user = session?.user;

  // Check user status if session exists
  if (user) {
    // Type assertion to access custom user fields
    const authUser = user as unknown as AuthUser;

    // Check if user is disabled
    if (isDisabled(authUser)) {
      logger.warn('Disabled user attempted to access resource', {
        userId: authUser.id,
        pathname,
      });

      const normalizedPath = stripLocalePrefix(pathname);
      if (normalizedPath !== ACCOUNT_DISABLED_PATH) {
        const accountDisabledUrl = new URL(
          locale ? `/${locale}${ACCOUNT_DISABLED_PATH}` : ACCOUNT_DISABLED_PATH,
          request.url,
        );
        return NextResponse.redirect(accountDisabledUrl);
      }
    }

    // Check if user is pending
    if (isPending(authUser)) {
      logger.warn('Pending user attempted to access resource', {
        userId: authUser.id,
        pathname,
      });

      const normalizedPath = stripLocalePrefix(pathname);
      if (normalizedPath !== ACCOUNT_DISABLED_PATH) {
        const accountDisabledUrl = new URL(
          locale ? `/${locale}${ACCOUNT_DISABLED_PATH}` : ACCOUNT_DISABLED_PATH,
          request.url,
        );
        return NextResponse.redirect(accountDisabledUrl);
      }
    }

    // If user is on account disabled page but is actually active, redirect to home
    const normalizedPath = stripLocalePrefix(pathname);
    if (normalizedPath === ACCOUNT_DISABLED_PATH && authUser.status === UserStatus.ACTIVE) {
      const homeUrl = new URL(locale ? `/${locale}` : '/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Redirect to sign-in if accessing protected paths without authentication
  if (matchesAnyPath(pathname, PROTECTED_PATHS) && !user) {
    const signInUrl = new URL(locale ? `/${locale}/sign-in` : '/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth paths while authenticated
  if (matchesAnyPath(pathname, AUTH_PATHS) && user) {
    const dashboardUrl = new URL(locale ? `/${locale}/dashboard` : '/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
  runtime: 'nodejs',
};
