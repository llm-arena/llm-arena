import { env } from '@lmring/env';
import * as Sentry from '@sentry/nextjs';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  spotlight: env.NODE_ENV === 'development',
  integrations: [Sentry.consoleLoggingIntegration()],
  sendDefaultPii: true,
  tracesSampleRate: 1,
  enableLogs: true,
  debug: false,
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (env.DATABASE_URL && env.DATABASE_URL !== '') {
      try {
        const { runMigrations } = await import('@lmring/database');
        await runMigrations();
      } catch (error) {
        if (env.NODE_ENV === 'production') {
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

  const sentryDisabled = (env.NEXT_PUBLIC_SENTRY_DISABLED ?? '').toLowerCase() === 'true';
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
