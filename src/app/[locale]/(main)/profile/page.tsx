export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

// 1. Dinaminė dalis
async function ProfileData() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Vardas:</strong> {session.user?.name}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>El. paštas:</strong> {session.user?.email}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>ID:</strong> {session.user?.id}
        </p>
      </div>

      {session.user?.image && (
        <img
          src={session.user.image}
          alt="Profilio nuotrauka"
          className="h-20 w-20 rounded-full border-2 border-blue-500"
        />
      )}
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profilis</h1>

        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileData />
        </Suspense>
      </div>
    </div>
  );
}
