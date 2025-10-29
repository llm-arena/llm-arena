import type { routing } from '@lmring/i18n';
import type messages from '@/locales/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
