export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import StatusContent from './StatusContent';

// 1. Dinaminė dalis (apgaubta Suspense)
async function StatusWrapper({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Status');

  return <StatusContent />;
}

// 2. Pagrindinis puslapis (sinchroninis, be params)
export default function StatusPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          {/* ✅ Spinner be teksto – vertimo nereikia */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <StatusWrapper params={params} />
    </Suspense>
  );
}
