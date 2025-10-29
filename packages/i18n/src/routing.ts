import { defineRouting } from 'next-intl/routing';
import { I18nConfig } from './config';

export const routing = defineRouting({
  locales: I18nConfig.locales,
  localePrefix: I18nConfig.localePrefix,
  defaultLocale: I18nConfig.defaultLocale,
  localeDetection: true,
});
