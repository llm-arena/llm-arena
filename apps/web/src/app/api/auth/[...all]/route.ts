/**
 * Better-Auth API route handler
 *
 * This catch-all route handles all Better-Auth API endpoints:
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * - And all other Better-Auth endpoints
 */

import { auth } from '@/libs/Auth';

export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  return auth.handler(request);
}
