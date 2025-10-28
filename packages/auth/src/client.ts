/**
 * Client-side authentication hooks and utilities
 */

'use client';

import { createAuthClient } from 'better-auth/react';

interface CreateAuthClientOptions {
  baseURL: string;
}

export function createClient(options: CreateAuthClientOptions) {
  const authClient = createAuthClient({
    baseURL: options.baseURL,
  });

  return authClient;
}

export type AuthClient = ReturnType<typeof createClient>;
