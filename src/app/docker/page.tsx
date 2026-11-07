import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import DockerContent from './DockerContent';

// 1. Dinaminė dalis (turi būti atskirai, kad galėtų būti apgaubta)
async function DockerProtectedContent() {
  await connection(); // Dabar tai yra Suspense viduje
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DockerContent />;
}

// 2. Puslapis su Suspense riba
export default function DockerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          Kraunamas Docker valdymas...
        </div>
      }
    >
      <DockerProtectedContent />
    </Suspense>
  );
}
