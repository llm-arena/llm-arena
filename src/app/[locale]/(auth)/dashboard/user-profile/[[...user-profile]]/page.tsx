import { createClient } from '@/libs/Supabase.server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IUserProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IUserProfilePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'UserProfile',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function UserProfilePage(props: IUserProfilePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'UserProfile',
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: Implement user profile page
  // - Display user information
  // - Edit profile form
  // - Change password
  // - Manage API keys
  // - Upload avatar
  return (
    <div className="my-6">
      <h1 className="mb-6 text-2xl font-bold">{t('meta_title')}</h1>
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">User Information</h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium text-gray-700">Email:</dt>
            <dd className="text-gray-600">{user?.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">User ID:</dt>
            <dd className="text-gray-600">{user?.id}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-gray-500">
          User profile page with Supabase needs to be implemented. See IMPLEMENTATION_SUMMARY.md for
          details.
        </p>
      </div>
    </div>
  );
}
