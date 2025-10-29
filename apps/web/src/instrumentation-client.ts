import { env } from '@lmring/env';
import * as Sentry from '@sentry/nextjs';

const sentryDisabled = (env.NEXT_PUBLIC_SENTRY_DISABLED ?? '').toLowerCase() === 'true';
if (!sentryDisabled) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.consoleLoggingIntegration(),
      Sentry.browserTracingIntegration(),
      ...(env.NODE_ENV === 'development' ? [Sentry.spotlightBrowserIntegration()] : []),
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
