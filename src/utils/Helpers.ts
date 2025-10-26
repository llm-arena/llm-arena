import { Env } from '@/libs/Env';
import { routing } from '@/libs/I18nRouting';

export const getBaseUrl = () => {
  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  if (Env.VERCEL_ENV === 'production' && Env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${Env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (Env.VERCEL_URL) {
    return `https://${Env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

export const getI18nPath = (url: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

export const isServer = () => {
  return typeof window === 'undefined';
};
