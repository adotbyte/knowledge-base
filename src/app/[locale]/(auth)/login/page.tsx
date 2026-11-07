import { setRequestLocale, getTranslations } from 'next-intl/server';
import LoginForm from './LoginForm';

export const instant = false;

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // 1. Nustatome kalbą statiniam generavimui
  setRequestLocale(locale);

  // 2. Ištraukiame vertimus SERVERYJE
  const t = await getTranslations('Login');

  // 3. Perduodame vertimus į Kliento komponentą
  return (
    <LoginForm
      translations={{
        title: t('title'),
        subtitle: t('subtitle'),
        github: t('github'),
        google: t('google'),
        demo: t('demo'),
        privacy: t('privacy'),
        loading: t('loading'),
      }}
      language={locale}
    />
  );
}
