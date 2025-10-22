import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <div className="py-12">
      <section className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          {t('description')}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/sign-up/"
            className="rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
          >
            {t('get_started')}
          </Link>
          <Link
            href="/dashboard/"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-900 hover:bg-gray-100"
          >
            {t('view_dashboard')}
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900">
          {t('features_title')}
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t('feature_1_title')}
            </h3>
            <p className="mt-2 text-gray-600">
              {t('feature_1_description')}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t('feature_2_title')}
            </h3>
            <p className="mt-2 text-gray-600">
              {t('feature_2_description')}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t('feature_3_title')}
            </h3>
            <p className="mt-2 text-gray-600">
              {t('feature_3_description')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
