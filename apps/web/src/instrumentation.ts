import * as Sentry from '@sentry/nextjs';
import { Env } from '@/libs/Env';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: Env.NEXT_PUBLIC_SENTRY_DSN,
  spotlight: Env.NODE_ENV === 'development',
  integrations: [Sentry.consoleLoggingIntegration()],
  sendDefaultPii: true,
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (Env.DATABASE_URL && Env.DATABASE_URL !== '') {
      try {
        const { runMigrations } = await import('@lmring/database');
        await runMigrations();
      } catch (error) {
        if (Env.NODE_ENV === 'production') {
          console.error('Migration failed in production, stopping application');
          throw error;
        }
        console.error('Migration failed in development mode, continuing without migrations');
        console.error('Make sure your DATABASE_URL is correct and the database is accessible');
      }
    } else {
      console.error('DATABASE_URL not configured, skipping migrations');
    }
  }

  const sentryDisabled = (Env.NEXT_PUBLIC_SENTRY_DISABLED ?? '').toLowerCase() === 'true';
  if (!sentryDisabled) {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      Sentry.init(sentryOptions);
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      Sentry.init(sentryOptions);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
