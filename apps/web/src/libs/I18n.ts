import { createI18nRequestConfig } from '@lmring/i18n';

export default createI18nRequestConfig(async (locale: string) => {
  return (await import(`../locales/${locale}.json`)).default;
});
