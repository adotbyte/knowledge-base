// app/profile/page.tsx
import { auth } from '../auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profilis</h1>
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
            className="h-20 w-20 rounded-full"
          />
        )}
      </div>
    </div>
  );
}
