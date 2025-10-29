import type { Messages } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { type Locale, I18nConfig } from './config';
import { routing } from './routing';

// NextJS Boilerplate uses Crowdin as the localization software.
// As a developer, you only need to take care of the English (or another default language) version.
// Other languages are automatically generated and handled by Crowdin.

// The localisation files are synced with Crowdin using GitHub Actions.
// By default, there are 3 ways to sync the message files:
// 1. Automatically sync on push to the `main` branch
// 2. Run manually the workflow on GitHub Actions
// 3. Every 24 hours at 5am, the workflow will run automatically

/**
 * Helper to check if a locale is supported
 */
function hasLocale(locale: string | undefined): locale is Locale {
  return locale != null && (I18nConfig.locales as readonly string[]).includes(locale);
}

/**
 * Creates a request config for next-intl
 * @param getMessages - Function to load messages for a given locale
 */
export function createI18nRequestConfig(getMessages: (locale: Locale) => Promise<Messages>) {
  return getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale: Locale = hasLocale(requested) ? requested : routing.defaultLocale;

    return {
      locale,
      messages: await getMessages(locale),
    };
  });
}
