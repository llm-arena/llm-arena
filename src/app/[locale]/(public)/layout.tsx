import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function PublicLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'PublicLayout',
  });

  return (
    <BaseTemplate
      showSidebar={false}
      rightNav={
        <>
          <li>
            <Link href="/sign-in/" className="border-none text-gray-700 hover:text-gray-900">
              {t('sign_in_link')}
            </Link>
          </li>
          <li>
            <Link href="/sign-up/" className="border-none text-gray-700 hover:text-gray-900">
              {t('sign_up_link')}
            </Link>
          </li>
          <li>
            <Link href="/dashboard/" className="border-none text-gray-700 hover:text-gray-900">
              {t('dashboard_link')}
            </Link>
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
