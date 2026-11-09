export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import DeleteAccountButton from '@/components/DeleteAccountButton'; // <-- IMPORTAS

// 1. Dinaminė dalis
async function ProfileData() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const t = await getTranslations('Profile'); // <-- Vertimai

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-gray-600 dark:text-gray-400">
          <strong>{t('name')}:</strong> {session.user?.name}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>{t('email')}:</strong> {session.user?.email}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>{t('id')}:</strong> {session.user?.id}
        </p>
      </div>

      {session.user?.image && (
        <img
          src={session.user.image}
          alt={t('profileImage')}
          referrerPolicy="no-referrer"
          className="h-20 w-20 rounded-full border-2 border-blue-500"
        />
      )}

      {/* ✅ PAVOJINGA ZONA */}
      <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2 className="mb-2 text-lg font-bold text-red-600 dark:text-red-400">{t('dangerZone')}</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {t('dangerZoneDescription')}
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}

// 2. Skeleton
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-4 h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}

// 3. Pagrindinis puslapis
export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Profile'); // <-- Vertimai pavadinimui

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>

        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileData />
        </Suspense>
      </div>
    </div>
  );
}
