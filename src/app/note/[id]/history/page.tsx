import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '../../../../components/MarkdownRenderer';
import { Suspense } from 'react';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function HistoryContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- params išsprendžiami ČIA (Suspense viduje)

  // 1. Patikriname, ar vartotojas prisijungęs
  const userId = 'admin';

  // 2. Ieškome užrašo TIK to vartotojo
  const note = await prisma.note.findUnique({
    where: { id: id, userId: userId }, // <-- Pakeista iš "admin" į userId
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
          Current Version
        </span>
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{note.title}</h2>
        <p className="mb-4 text-xs text-gray-400">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
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
            Saved on: {new Date(version.createdAt).toLocaleString()}
          </p>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <MarkdownRenderer content={version.content} />
          </div>
        </div>
      ))}

      {note.versions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900">
          No previous versions yet. Start editing to create history.
        </div>
      )}
    </div>
  );
}

// 2. Pagrindinis puslapis (sinchroninis, be await params)
export default function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            &larr; Back to Notes
          </Link>
          <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white">
            Version History
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse p-10 text-center font-medium text-gray-500">
              Loading history...
            </div>
          }
        >
          <HistoryContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
