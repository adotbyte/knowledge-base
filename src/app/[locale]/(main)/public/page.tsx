export const instant = false; // ✅ PRIVERČIAME BŪTI DINAMINĮ

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Link } from '@/i18n/routing';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import PublicSearchBar from '@/components/PublicSearchBar';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function stripMarkdown(text: string) {
  return text
    .replace(/[#*`_~]/g, '')
    .replace(/---/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Dinaminė dalis (priima searchParams)
async function PublicNotesContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searchQuery = q?.replace('#', '').trim();
  const t = await getTranslations('Public');

  const notes = await prisma.note.findMany({
    where: {
      isPublic: true,
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
        ],
      }),
    },
    include: { tags: true, attachments: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (notes.length === 0) {
    return <div className="p-20 text-center text-gray-500">{t('noNotes')}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {notes.map((note) => (
        <Link
          href={`/share/${note.shareId}`}
          key={note.id}
          className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800"
        >
          <h2 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
            {note.title}
          </h2>

          {note.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {stripMarkdown(note.content).substring(0, 150)}...
          </p>

          {note.attachments && note.attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {note.attachments.map((file: any) => (
                <span
                  key={file.id}
                  className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  📎 {file.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-400">
            {t('updated')}: {new Date(note.updatedAt).toLocaleDateString()}
          </div>
        </Link>
      ))}
    </div>
  );
}

// 2. Dinaminis apvalkalas
async function PublicContent({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Public');

  return (
    <>
      <div className="mb-8 flex justify-end">
        <Suspense
          fallback={
            <div className="h-9 w-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
          }
        >
          <PublicSearchBar />
        </Suspense>
      </div>

      <div className="mb-10 text-center">
        <h1 className="mb-4 text-4xl font-black text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse p-20 text-center text-gray-500">{t('loading')}</div>
        }
      >
        <PublicNotesContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

// 3. Pagrindinis puslapis (sinchroninis)
export default function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans dark:bg-gray-950">
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center text-gray-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          }
        >
          <PublicContent params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}