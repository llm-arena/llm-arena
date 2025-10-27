import type { LocalePrefixMode } from 'next-intl/routing';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'lmring',
  locales: ['en', 'zh', 'fr'],
  defaultLocale: 'en',
  localePrefix,
};
