import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function DashboardContent() {
  await connection(); // Next.js 16 reikalavimas

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

  const userId = session.user.id;

  // 1. Pagrindinė statistika
  const [totalNotes, totalTags, totalAttachments, totalStorage] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.tag.count(),
    prisma.attachment.count({ where: { note: { userId } } }),
    prisma.attachment.aggregate({
      where: { note: { userId } },
      _sum: { size: true },
    }),
  ]);

  // 2. Populiariausios žymės
  const topTags = await prisma.tag.findMany({
    take: 5,
    include: {
      _count: {
        select: { notes: true },
      },
    },
    orderBy: {
      notes: { _count: 'desc' },
    },
  });

  // 3. Paskutiniai užrašai
  const recentNotes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, createdAt: true },
  });

  const storageMB = (totalStorage._sum.size || 0) / (1024 * 1024);

  return (
    <div className="space-y-8">
      {/* 1. Kortelės */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">📝</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Iš viso užrašų
          </h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{totalNotes}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">🏷️</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            Unikalios žymės
          </h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{totalTags}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">📎</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">Failai</h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">
            {totalAttachments}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">💾</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">Užimta vieta</h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">
            {storageMB.toFixed(2)} MB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 2. Paskutiniai užrašai */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Paskutiniai užrašai
          </h3>
          <div className="space-y-3">
            {recentNotes.length === 0 ? (
              <p className="text-sm text-gray-500">Nėra užrašų.</p>
            ) : (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <Link
                    href={`/note/${note.id}/edit`}
                    className="mr-4 truncate font-semibold text-gray-800 hover:text-blue-600 dark:text-gray-200"
                  >
                    {note.title}
                  </Link>
                  <span className="text-xs whitespace-nowrap text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Top žymės */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Populiariausios žymės
          </h3>
          <div className="space-y-3">
            {topTags.length === 0 ? (
              <p className="text-sm text-gray-500">Nėra žymių.</p>
            ) : (
              topTags.map((tag, index) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-400">#{index + 1}</span>
                    <Link
                      href={`/?tag=${tag.name}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      #{tag.name}
                    </Link>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {tag._count.notes} užrašai
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your knowledge base at a glance
            </p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Back to Notes
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse p-20 text-center font-medium text-gray-500">
              Loading dashboard...
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
