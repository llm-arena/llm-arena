import type { LocalePrefixMode } from 'next-intl/routing';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'Model Arena',
  locales: ['en', 'zh', 'fr'],
  defaultLocale: 'en',
  localePrefix,
};
