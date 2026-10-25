import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { updateNote } from '../../../actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Navbar from '../../../components/Navbar';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = "admin"; // <-- Naudojame fiksuotą vartotoją

  const note = await prisma.note.findUnique({
    where: { id: id, userId: userId },
    include: { tags: true, attachments: true },
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

      {/* --- NAUJAS: FAILŲ ĮKĖLIMAS --- */}
      <div className="relative z-10 pointer-events-none mt-2">
        <label htmlFor="files" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Add Attachments</label>
        <input 
          type="file" 
          id="files"
          name="files" 
          multiple 
          className="pointer-events-auto w-full p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700 transition-none" 
        />
      </div>
      {/* Jau prisegti failai */}
      {note.attachments && note.attachments.length > 0 && (
        <div className="mt-4">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Current Attachments</label>
          <div className="flex flex-wrap gap-2">
            {note.attachments.map((file: any) => (
              <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  📎 {file.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      <button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none mt-2"
      >
        Update Note
      </button>
    </form>
  );
}

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    // PRIDĖTA: bg-gray-50 dark:bg-gray-950 ir min-h-screen
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 py-10">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline text-sm font-semibold">
            &larr; Back to Notes
          </Link>
          <h1 className="text-3xl font-black mt-4 text-gray-900 dark:text-white">Edit Note</h1>
        </div>
        
        <Suspense fallback={
          <div className="text-center p-10 text-gray-500 animate-pulse font-medium">
            Loading note...
          </div>
        }>
          <EditForm params={params} />
        </Suspense>
      </div>
    </div>
  );
  
}