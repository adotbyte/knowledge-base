import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import DockerContent from './DockerContent'; // <-- Įsitikinkite, kad šis failas egzistuoja

async function DockerProtectedContent() {
  await connection(); // Next.js 16 reikalavimas dinaminiam puslapiui

  const session = await auth();

  // 1. Patikriname, ar vartotojas prisijungęs
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. TIKRINAME, AR TAI ADMINISTRATORIUS
  const ADMIN_EMAIL = 'adotbyte@gmail.com'; // <-- Įrašykite savo el. paštą!

  if (session.user.email !== ADMIN_EMAIL) {
    redirect('/'); // Ne adminus nukreipiame į pradžią
  }

  return <DockerContent />;
}

export default function DockerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen animate-pulse items-center justify-center text-gray-500">
          Kraunamas Docker valdymas...
        </div>
      }
    >
      <DockerProtectedContent />
    </Suspense>
  );
}
