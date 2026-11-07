// app/profile/page.tsx
import { Suspense } from 'react';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';

// 1. Išskiriame dinaminę dalį į atskirą komponentą
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

// 2. Skeleton (Kraunamas vaizdas), kuris rodomas, kol laukiama duomenų
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

// 3. Pagrindinis puslapis lieka statiškas ir akimirksniu įkeliamas
export default function ProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profilis</h1>

        {/* Apgaubiame dinaminius duomenis */}
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileData />
        </Suspense>
      </div>
    </div>
  );
}
