import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import StatusContent from './StatusContent'; // Importuojame jūsų sukurtą komponentą

export default async function StatusPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <StatusContent />;
}
