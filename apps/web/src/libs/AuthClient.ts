/**
 * Better-Auth client instance for client-side authentication
 */

'use client';

import { createClient } from '@lmring/auth/client';

export const authClient = createClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// Export useSession hook from the auth client instance
export const { useSession } = authClient;
