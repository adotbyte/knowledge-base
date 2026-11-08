export const instant = false;

import { Link } from '@/i18n/routing';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { auth } from '@/app/auth';
import {
  deleteNote,
  toggleShare,
  summarizeNote,
  improveNote,
  toggleFileShare,
} from '@/app/actions';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import CopyButton from '@/components/CopyButton';
import DeleteConfirmButton from '@/components/DeleteConfirmButton';
import ActionButton from '@/components/ActionButton';
import HomeClient from '@/components/HomeClient';
import HomeFormClient from '@/components/HomeFormClient'; // <-- PRIDĖTAS IMPORTAS

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 1. Apsaugotas turinys (serverinis)
async function ProtectedContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { q, tag } = await searchParams;
  const searchQuery = q?.replace('#', '').trim();
  const userId = session.user.id;
  const t = await getTranslations('Home');

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { some: { name: { contains: searchQuery, mode: 'insensitive' } } } },
        ],
      }),
      ...(tag && { tags: { some: { name: tag } } }),
    },
    include: { tags: true, attachments: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* LEFT COLUMN: Create Form */}
      <div className="lg:col-span-1">
        <HomeFormClient /> {/* <-- Pakeista */}
      </div>

      {/* RIGHT COLUMN: Notes List */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('yourNotes')}{' '}
            <span className="text-blue-600 dark:text-blue-400">({notes.length})</span>
          </h2>
          {tag && (
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <span>
                {t('filteringBy')}: #{tag}
              </span>
              <Link
                href="/"
                className="hover:text-blue-900 dark:hover:text-white"
                title={t('clearFilter')}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
              <p className="text-gray-500 dark:text-gray-400">{t('noNotes')}</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{note.title}</h3>
                  <div className="flex items-center gap-2">
                    <CopyButton text={note.content} />
                    <Link
                      href={`/note/${note.id}/edit`}
                      className="p-1 text-gray-400 transition-colors hover:text-blue-500"
                      title={t('editNote')}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    <ActionButton
                      action={summarizeNote}
                      className="p-1 text-gray-400 transition-colors hover:text-purple-500"
                      title={t('summarize')}
                    >
                      <input type="hidden" name="id" value={note.id} />
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </ActionButton>
                    <ActionButton
                      action={improveNote}
                      className="p-1 text-gray-400 transition-colors hover:text-amber-500"
                      title={t('improve')}
                    >
                      <input type="hidden" name="id" value={note.id} />
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 4l5 5M6 13l5-5m-5 5l2 2m-2-2l-2-2m7 7l5 5m-5-5l-2-2m2 2l2 2M9 9l6 6M12 3v2m0 14v2M3 12h2m14 0h2"
                        />
                      </svg>
                    </ActionButton>
                    <form action={toggleShare}>
                      <input type="hidden" name="id" value={note.id} />
                      <input type="hidden" name="isPublic" value={String(note.isPublic)} />
                      <button
                        type="submit"
                        className={`p-1 transition-colors ${note.isPublic ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                        title={note.isPublic ? t('stopSharing') : t('share')}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </button>
                    </form>
                    <form action={deleteNote}>
                      <input type="hidden" name="id" value={note.id} />
                      <DeleteConfirmButton>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </DeleteConfirmButton>
                    </form>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                  <MarkdownRenderer content={note.content} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Pagrindinis puslapis (sinchroninis)
export default function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans dark:bg-gray-950">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          }
        >
          <HomeWrapper params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

// ✅ DINAMINĖ DALIS (apgaubta Suspense)
async function HomeWrapper({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <>
      <HomeClient translations={{ yourNotes: t('yourNotes') }} />

      <Suspense
        fallback={
          <div className="flex animate-pulse items-center justify-center p-20 font-medium text-gray-500">
            {t('loading')}
          </div>
        }
      >
        <ProtectedContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
