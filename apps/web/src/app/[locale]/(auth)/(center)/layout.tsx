import type { Locale } from '@lmring/i18n';
import { setRequestLocale } from 'next-intl/server';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);

  return <div className="flex min-h-screen items-center justify-center">{props.children}</div>;
}
