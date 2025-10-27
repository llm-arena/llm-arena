import { Env } from '@/libs/Env';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(Env.NEXT_PUBLIC_SUPABASE_URL, Env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
