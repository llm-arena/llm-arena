import { Env } from '@/libs/Env';
import * as Sentry from '@sentry/nextjs';

if (!Env.NEXT_PUBLIC_SENTRY_DISABLED) {
  Sentry.init({
    dsn: Env.SENTRY_DSN,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.consoleLoggingIntegration(),
      Sentry.browserTracingIntegration(),
      ...(Env.NODE_ENV === 'development' ? [Sentry.spotlightBrowserIntegration()] : []),
    ],
    sendDefaultPii: true,
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    debug: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
