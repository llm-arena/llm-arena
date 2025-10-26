import arcjet from '@/libs/Arcjet';
import { detectBot } from '@arcjet/next';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_PATHS = ['/dashboard'];
const AUTH_PATHS = ['/sign-in', '/sign-up'];
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

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const locale = pathname.match(LOCALE_PREFIX_REGEX)?.[1] ?? '';

  if (matchesAnyPath(pathname, PROTECTED_PATHS) && !user) {
    const signInUrl = new URL(locale ? `/${locale}/sign-in` : '/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

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
