// src/app/docker/page.tsx
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import DockerContent from './DockerContent'; // Importuojame teisingu keliu

export default async function DockerPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DockerContent />;
}
