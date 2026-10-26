import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import { Suspense } from 'react';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function HistoryContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- params išsprendžiami ČIA (Suspense viduje)

  // 1. Patikriname, ar vartotojas prisijungęs
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

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
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-green-500/50 shadow-sm relative">
        <span className="absolute -top-3 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Current Version</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{note.title}</h2>
        <p className="text-xs text-gray-400 mb-4">Last updated: {new Date(note.updatedAt).toLocaleString()}</p>
        <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <MarkdownRenderer content={note.content} />
        </div>
      </div>

      {/* Senos versijos */}
      {note.versions.map((version) => (
        <div key={version.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{version.title}</h2>
          <p className="text-xs text-gray-400 mb-4">Saved on: {new Date(version.createdAt).toLocaleString()}</p>
          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <MarkdownRenderer content={version.content} />
          </div>
        </div>
      ))}

      {note.versions.length === 0 && (
        <div className="text-center p-10 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          No previous versions yet. Start editing to create history.
        </div>
      )}
    </div>
  );
}

// 2. Pagrindinis puslapis (sinchroninis, be await params)
export default function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline text-sm font-semibold">
            &larr; Back to Notes
          </Link>
          <h1 className="text-3xl font-black mt-4 text-gray-900 dark:text-white">Version History</h1>
        </div>

        <Suspense fallback={
          <div className="text-center p-10 text-gray-500 animate-pulse font-medium">
            Loading history...
          </div>
        }>
          <HistoryContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}