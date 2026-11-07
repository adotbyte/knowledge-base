import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Link from 'next/link';
import { Suspense } from 'react';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 1. Šis komponentas dabar priima params ir pats juos išsprendžia
async function SharedNoteContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- Išsprendžiame params ČIA (Suspense viduje)

  const note = await prisma.note.findUnique({
    where: { shareId: id, isPublic: true },
    include: { tags: true, attachments: true },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-12 dark:border-gray-800 dark:bg-gray-900">
      <h1 className="mb-4 text-4xl font-black text-gray-900 dark:text-white">{note.title}</h1>

      {note.tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 border-b border-gray-100 pb-6 dark:border-gray-800">
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

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950">
        <MarkdownRenderer content={note.content} />
      </div>
      {/* --- NAUJAS: FAILŲ SĄRAŠAS --- */}
      {note.attachments && note.attachments.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Attachments
          </h3>
          <div className="flex flex-wrap gap-2">
            {note.attachments.map((file: any) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                📎 {file.name}
              </a>
            ))}
          </div>
        </div>
      )}
      {/* ------------------------------ */}

      <p className="mt-8 text-center text-xs text-gray-400">
        Shared on {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

// 2. Pagrindinis puslapis dabar yra SINCHRONINIS (be async ir be await params)
export default function SharedNotePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="https://knowledge.morkunas.info"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            &larr; Go to my Knowledge Base
          </Link>
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Shared Note
          </span>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto mb-4 h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="mx-auto h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
            </div>
          }
        >
          {/* Perduodame params kaip Promise į vidinį komponentą */}
          <SharedNoteContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
