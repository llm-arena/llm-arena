import type { LocalePrefixMode } from 'next-intl/routing';

const localePrefix: LocalePrefixMode = 'as-needed';

export const I18nConfig = {
  locales: ['en', 'zh', 'fr'] as const,
  defaultLocale: 'en' as const,
  localePrefix,
} as const;

export type Locale = (typeof I18nConfig.locales)[number];
