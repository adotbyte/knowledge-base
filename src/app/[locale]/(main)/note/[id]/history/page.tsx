export const instant = false;

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound, redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { getTranslations } from 'next-intl/server'; // <-- Vertimams

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function HistoryContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('Components'); // <-- Vertimų hook'as

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  const userId = session.user.id;

  const note = await prisma.note.findUnique({
    where: { id: id, userId: userId },
    include: {
      versions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Dabartinė versija */}
      <div className="relative rounded-2xl border-2 border-green-500/50 bg-white p-6 shadow-sm dark:bg-gray-900">
        <span className="absolute -top-3 left-4 rounded-md bg-green-500 px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
          {t('currentVersion')} {/* <-- VERTIMAS */}
        </span>
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{note.title}</h2>
        <p className="mb-4 text-xs text-gray-400">
          {t('lastUpdated')}: {new Date(note.updatedAt).toLocaleString()} {/* <-- VERTIMAS */}
        </p>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <MarkdownRenderer content={note.content} />
        </div>
      </div>

      {/* Senos versijos */}
      {note.versions.map((version) => (
        <div
          key={version.id}
          className="rounded-2xl border border-gray-100 bg-white p-6 opacity-80 shadow-sm transition-opacity hover:opacity-100 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{version.title}</h2>
          <p className="mb-4 text-xs text-gray-400">
            {t('savedOn')}: {new Date(version.createdAt).toLocaleString()} {/* <-- VERTIMAS */}
          </p>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <MarkdownRenderer content={version.content} />
          </div>
        </div>
      ))}

      {note.versions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900">
          {t('noPreviousVersions')} {/* <-- VERTIMAS */}
        </div>
      )}
    </div>
  );
}

export default async function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('Components'); // <-- Pridėtas await

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            &larr; {t('backToNotes')}
          </Link>
          <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white">
            {t('versionHistory')}
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse p-10 text-center font-medium text-gray-500">
              {t('loadingHistory')}
            </div>
          }
        >
          <HistoryContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
