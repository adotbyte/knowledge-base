'use client';

import { useTranslations } from 'next-intl';

export default function PrivacyContent() {
  const t = useTranslations('Privacy');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>

      <p className="mb-4">{t('intro')}</p>

      <h2 className="mt-6 mb-2 text-xl font-bold">{t('section1Title')}</h2>
      <p className="mb-4">{t('section1Text')}</p>

      <h2 className="mt-6 mb-2 text-xl font-bold">{t('section2Title')}</h2>
      <p className="mb-4">{t('section2Text')}</p>

      <h2 className="mt-6 mb-2 text-xl font-bold">{t('section3Title')}</h2>
      <p className="mb-4">{t('section3Text')}</p>

      <h2 className="mt-6 mb-2 text-xl font-bold">{t('section4Title')}</h2>
      <p className="mb-4">{t('section4Text')}</p>
    </div>
  );
}
