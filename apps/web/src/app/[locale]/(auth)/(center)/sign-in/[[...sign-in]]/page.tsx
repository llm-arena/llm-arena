import type { Locale } from '@lmring/i18n';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthFormWrapper } from '@/components/auth';

type ISignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata(props: ISignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: ISignInPageProps) {
  const { locale } = await props.params;
  const { callbackUrl } = await props.searchParams;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'SignIn',
  });

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('meta_title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('meta_description')}</p>
      </div>

      <AuthFormWrapper type="signin" callbackUrl={callbackUrl || `/${locale}/dashboard`} />

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href={`/${locale}/sign-up`} className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
