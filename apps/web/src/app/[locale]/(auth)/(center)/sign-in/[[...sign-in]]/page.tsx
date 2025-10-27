import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ISignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: ISignInPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  // TODO: Implement Supabase Auth sign-in form
  // - Email/Password form
  // - OAuth buttons (Google, GitHub, LinuxDO)
  // - Error handling
  // - Redirect to dashboard on success
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-6 text-2xl font-bold">{t('meta_title')}</h1>
        <p className="text-gray-600">Sign-in page with Supabase Auth needs to be implemented.</p>
        <p className="mt-4 text-sm text-gray-500">See IMPLEMENTATION_SUMMARY.md for details.</p>
      </div>
    </div>
  );
}
