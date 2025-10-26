import { createClient } from '@/libs/Supabase.server';
import { getTranslations } from 'next-intl/server';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <p>
      {'👋 '}
      {t('hello_message', { email: user?.email ?? '' })}
    </p>
  );
};
