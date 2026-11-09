export const instant = false;

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound, redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import EditFormClient from './EditFormClient';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function EditFormData({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const note = await prisma.note.findUnique({
    where: { id: id, userId: session.user.id },
    include: { tags: true, attachments: true },
  });

  if (!note) notFound();

  const t = await getTranslations('Components');

  return (
    <EditFormClient
      note={{
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags.map((tag) => tag.name).join(', '),
        attachments: note.attachments.map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
        })),
      }}
      translations={{
        viewHistory: t('viewHistory'),
        title: t('title'),
        content: t('content'),
        tags: t('tags'),
        tagsPlaceholder: t('tagsPlaceholder'),
        addAttachments: t('addAttachments'),
        currentAttachments: t('currentAttachments'),
        updateNote: t('updateNote'),
      }}
    />
  );
}

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Components');

  return (
    <div className="min-h-screen bg-gray-50 font-sans dark:bg-gray-950">
      <div className="mx-auto max-w-3xl p-6 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            &larr; {t('backToNotes')}
          </Link>
          <div className="mt-4 flex items-end justify-between">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('editNote')}</h1>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse p-10 text-center font-medium text-gray-500">
              {t('loadingNote')}
            </div>
          }
        >
          <EditFormData params={params} />
        </Suspense>
      </div>
    </div>
  );
}
