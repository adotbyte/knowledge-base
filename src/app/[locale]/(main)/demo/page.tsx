import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import DemoContent from './DemoContent';

export const instant = false;

export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Demo');

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          {t('loading')}
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}
