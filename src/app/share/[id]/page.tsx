import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import Link from 'next/link';
import { Suspense } from 'react';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 1. Šis komponentas dabar priima params ir pats juos išsprendžia
async function SharedNoteContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- Išsprendžiame params ČIA (Suspense viduje)

  const note = await prisma.note.findUnique({
    where: { shareId: id, isPublic: true },
    include: { tags: true },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{note.title}</h1>
      
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
          {note.tags.map((tag) => (
            <span key={tag.id} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-md">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
        <MarkdownRenderer content={note.content} />
      </div>
      
      <p className="text-xs text-gray-400 mt-8 text-center">
        Shared on {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

// 2. Pagrindinis puslapis dabar yra SINCHRONINIS (be async ir be await params)
export default function SharedNotePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/login" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Go to my Knowledge Base
          </Link>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shared Note</span>
        </div>

        <Suspense fallback={
          <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto"></div>
          </div>
        }>
          {/* Perduodame params kaip Promise į vidinį komponentą */}
          <SharedNoteContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}