import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import StatusContent from './StatusContent';

// 1. Dinaminė dalis
async function StatusProtectedContent() {
  await connection(); // Priverčiame būti dinamišku
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <StatusContent />;
}

// 2. Puslapis su Suspense
export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen animate-pulse items-center justify-center text-gray-500">
          Kraunamas statusas...
        </div>
      }
    >
      <StatusProtectedContent />
    </Suspense>
  );
}
