import { currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');
  const user = await currentUser();

  return (
    <p>
      {'👋 '}
      {t('hello_message', { email: user?.primaryEmailAddress?.emailAddress ?? '' })}
    </p>
  );
};
