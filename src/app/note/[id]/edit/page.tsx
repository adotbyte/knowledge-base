import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { updateNote } from '../../../actions';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 1. EditForm priima `params` pažadą ir pats jį išsprendžia
async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- Išsprendžiame params ČIA
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const note = await prisma.note.findUnique({
    where: { id: id, userId: session.user.id },
    include: { tags: true },
  });

  if (!note) {
    notFound();
  }

  const tagsString = note.tags.map(t => t.name).join(', ');
  const updateNoteWithId = updateNote.bind(null, note.id);

  return (
    <form action={updateNoteWithId} className="flex flex-col gap-6 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div>
        <label htmlFor="title" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Title</label>
        <input 
          type="text" 
          id="title"
          name="title" 
          defaultValue={note.title}
          required
          className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Content</label>
        <textarea 
          id="content"
          name="content" 
          defaultValue={note.content}
          required
          rows={12}
          className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Tags (comma separated)</label>
        <input 
          type="text" 
          id="tags"
          name="tags" 
          defaultValue={tagsString}
          placeholder="e.g., Docker, Linux, Config" 
          className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white text-sm"
        />
      </div>

      <button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none mt-2"
      >
        Update Note
      </button>
    </form>
  );
}

// 2. Pagrindinis puslapis dabar yra paprastas ir sinchroninis!
// Jis nebesprendžia params, o tiesiog perduoda juos į EditForm.
export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline text-sm font-semibold">
          &larr; Back to Notes
        </Link>
        <h1 className="text-3xl font-black mt-4">Edit Note</h1>
      </div>

      <Suspense fallback={
        <div className="text-center p-10 text-gray-500 animate-pulse font-medium">
          Loading note...
        </div>
      }>
        {/* Perduodame params kaip Promise į EditForm */}
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}