export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import DockerContent from './DockerContent';

// ✅ DINAMINĖ DALIS (apgaubta Suspense)
async function DockerWrapper({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Docker');

  return (
    <DockerContent
      translations={{
        title: t('title'),
        subtitle: t('subtitle'),
        backToNotes: t('backToNotes'),
        loading: t('loading'),
        noContainers: t('noContainers'),
        containerName: t('containerName'),
        containerState: t('containerState'),
        containerImage: t('containerImage'),
        actions: t('actions'),
        running: t('running'),
        stopped: t('stopped'),
        start: t('start'),
        stop: t('stop'),
        restart: t('restart'),
      }}
    />
  );
}

// ✅ PUSLAPIS SU SUSPENSE
export default function DockerPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          {/* ✅ Spinner be teksto – vertimo nereikia */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <DockerWrapper params={params} />
    </Suspense>
  );
}
