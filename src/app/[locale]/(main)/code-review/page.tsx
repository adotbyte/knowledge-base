import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import CodeReviewContent from './CodeReviewContent';

export const instant = false;

export default async function CodeReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div>Kraunama...</div>}>
      <CodeReviewContent />
    </Suspense>
  );
}
