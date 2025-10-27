import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { createClient } from '@/libs/Supabase.server';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(locale ? `/${locale}/sign-in` : '/sign-in');
  }

  // TODO: Implement sign-out functionality
  // Create a form action or API route to handle sign out
  return (
    <BaseTemplate
      leftNav={
        <>
          <li>
            <Link href="/dashboard/" className="border-none text-gray-700 hover:text-gray-900">
              {t('dashboard_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/user-profile/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('user_profile_link')}
            </Link>
          </li>
        </>
      }
      rightNav={
        <>
          <li>
            <button className="border-none text-gray-700 hover:text-gray-900" type="button">
              {t('sign_out')}
            </button>
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      }
    >
      {props.children}
    </BaseTemplate>
  );
}
