export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import PrivacyContent from './PrivacyContent';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <PrivacyContent />
    </Suspense>
  );
}
