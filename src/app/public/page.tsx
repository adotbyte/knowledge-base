import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import Link from 'next/link';
import { Suspense } from 'react';
import PublicSearchBar from '../components/PublicSearchBar';
import ThemeToggle from '../components/ThemeToggle';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function PublicNotesContent({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const searchQuery = q?.replace('#', '').trim();

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
    return (
      <div className="text-center p-20 text-gray-500">
        No public notes found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {notes.map((note) => (
        <Link 
          href={`/share/${note.shareId}`} 
          key={note.id}
          className="block bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
            {note.title}
          </h2>
          
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {note.tags.map(tag => (
                <span key={tag.id} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-md">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
            {note.content.substring(0, 150)}...
          </p>

          {note.attachments && note.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {note.attachments.map((file: any) => (
                <span key={file.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-300">
                  📎 {file.name}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-400">
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function PublicPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">K</div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight hidden sm:block">Public Knowledge Base</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="w-64 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>}>
              <PublicSearchBar />
            </Suspense>
            <ThemeToggle />
            <a href="https://knowledge.morkunas.info" className="text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors hidden sm:block">
              Go to App
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">My Public Notes</h1>
          <p className="text-gray-500 dark:text-gray-400">A collection of my public knowledge base entries.</p>
        </div>

        <Suspense fallback={
          <div className="text-center p-20 text-gray-500 animate-pulse">Loading public notes...</div>
        }>
          <PublicNotesContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}