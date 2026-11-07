import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server'; // <-- Importuojame connection
import DockerContent from './DockerContent';

export default async function DockerPage() {
  // 1. Priverčiame puslapį būti dinaminį
  await connection();

  // 2. Tikriname sesiją
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DockerContent />;
}
