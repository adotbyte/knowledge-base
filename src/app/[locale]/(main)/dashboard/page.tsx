export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import DashboardContent from './DashboardContent';
import { Link } from '@/i18n/routing';

// 1. Dinaminė dalis (apgaubta Suspense)
async function DashboardWrapper({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Dashboard');

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
          &larr; {t('backToNotes')}
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse p-20 text-center font-medium text-gray-500">
            {t('loading')}
          </div>
        }
      >
        <DashboardContent params={params} />
      </Suspense>
    </>
  );
}

// 2. Pagrindinis puslapis (sinchroninis, be params)
export default function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          }
        >
          <DashboardWrapper params={params} />
        </Suspense>
      </div>
    </div>
  );
}
