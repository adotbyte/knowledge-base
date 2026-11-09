export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import ExplainerContent from './ExplainerContent';

// ✅ DINAMINĖ DALIS (apgaubta Suspense)
async function ExplainerWrapper({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Explainer');

  return (
    <ExplainerContent
      translations={{
        title: t('title'),
        subtitle: t('subtitle'),
        backToNotes: t('backToNotes'),
        code: t('code'),
        placeholder: t('placeholder'),
        loginPrompt: t('loginPrompt'),
        loginButton: t('loginButton'),
        explainButton: t('explainButton'),
        explaining: t('explaining'),
        aiExplanation: t('aiExplanation'),
        emptyState: t('emptyState'),
        emptyStateSub: t('emptyStateSub'),
      }}
    />
  );
}

// ✅ PUSLAPIS SU SUSPENSE
export default function ExplainerPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          {/* ✅ Spinner be teksto – vertimo nereikia */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <ExplainerWrapper params={params} />
    </Suspense>
  );
}
