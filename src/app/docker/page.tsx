import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import StatusContent from './Docker'; // Importuojame jūsų sukurtą komponentą

export default async function Docker() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <Docker />;
}
