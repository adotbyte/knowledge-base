import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import StatusContent from './StatusContent';

async function StatusProtectedContent() {
  await connection();

  const session = await auth();

  // 1. Patikriname, ar apskritai yra sesija IR vartotojas
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. Dabar TypeScript žino, kad session.user tikrai egzistuoja.
  const ADMIN_EMAIL = 'adotbyte@gmail.com'; // Įrašykite savo el. paštą

  // 3. Tikriname el. paštą (naudojame ?. dėl saugumo)
  if (session.user.email !== ADMIN_EMAIL) {
    redirect('/'); // Ne adminus nukreipiame į pradžią
  }

  return <StatusContent />;
}

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
