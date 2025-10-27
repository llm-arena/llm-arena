import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ISignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignUpPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignUp',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignUpPage(props: ISignUpPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'SignUp',
  });

  // TODO: Implement Supabase Auth sign-up form
  // - Email/Password registration form
  // - OAuth buttons (Google, GitHub, LinuxDO)
  // - Email verification flow
  // - Error handling
  // - Redirect to dashboard on success
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-6 text-2xl font-bold">{t('meta_title')}</h1>
        <p className="text-gray-600">Sign-up page with Supabase Auth needs to be implemented.</p>
        <p className="mt-4 text-sm text-gray-500">See IMPLEMENTATION_SUMMARY.md for details.</p>
      </div>
    </div>
  );
}
