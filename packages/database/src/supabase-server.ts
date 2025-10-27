import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Env } from './env';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(Env.NEXT_PUBLIC_SUPABASE_URL, Env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Ignore errors in Server Components
          // This can happen when called from Server Components during SSR
        }
      },
    },
  });
}

