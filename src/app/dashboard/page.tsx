import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function DashboardContent() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [totalNotes, totalTags, totalAttachments, recentNotes] = await Promise.all([
    prisma.note.count({ where: { userId: session.user.id } }),
    prisma.tag.count(),
    prisma.attachment.count({ where: { note: { userId: session.user.id } } }),
    prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Notes</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{totalNotes}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-3xl mb-2">🏷️</div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique Tags</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{totalTags}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-3xl mb-2">📎</div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attachments</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{totalAttachments}</p>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Notes</h3>
        <div className="space-y-3">
          {recentNotes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No notes yet.</p>
          ) : (
            recentNotes.map(note => (
              <div key={note.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{note.title}</span>
                <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your knowledge base at a glance</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Back to Notes
          </Link>
        </div>

        <Suspense fallback={
          <div className="text-center p-20 text-gray-500 animate-pulse font-medium">
            Loading dashboard...
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}