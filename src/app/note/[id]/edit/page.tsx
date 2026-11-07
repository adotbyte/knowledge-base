import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { updateNote } from '../../../actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { auth } from '@/app/auth'; // <-- Pridėkite šį importą
import { redirect } from 'next/navigation'; // <-- Pridėkite šį importą

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Gauname sesiją
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  const userId = session.user.id; // <-- Naudojame tikrą ID

  const note = await prisma.note.findUnique({
    where: { id: id, userId: userId },
    include: { tags: true, attachments: true },
  });

  if (!note) {
    notFound();
  }

  const tagsString = note.tags.map((t) => t.name).join(', ');
  const updateNoteWithId = updateNote.bind(null, note.id);

  return (
    <div className="space-y-6">
      {' '}
      {/* <-- PRIDĖTAS WRAPPERIS */}
      {/* --- NAUJAS BLOKAS SU NUORODA --- */}
      <div className="flex justify-end">
        <Link
          href={`/note/${id}/history`}
          className="flex items-center gap-1 text-sm font-bold text-purple-600 hover:underline"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          View History
        </Link>
      </div>
      {/* -------------------------------- */}
      {/* Tavo forma */}
      <form
        action={updateNoteWithId}
        className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={note.title}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            Content
          </label>
          <textarea
            id="content"
            name="content"
            defaultValue={note.content}
            required
            rows={12}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            defaultValue={tagsString}
            placeholder="e.g., Docker, Linux, Config"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="pointer-events-none relative z-10 mt-2">
          <label
            htmlFor="files"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            Add Attachments
          </label>
          <input
            type="file"
            id="files"
            name="files"
            multiple
            className="pointer-events-auto w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-900 transition-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
          />
        </div>

        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Current Attachments
            </label>
            <div className="flex flex-wrap gap-2">
              {note.attachments.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    📎 {file.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="mt-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 dark:shadow-none"
        >
          Update Note
        </button>
      </form>
    </div>
  );
}

// 1. Pagrindinė puslapio funkcija (sinchroninė, be await params)
export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans dark:bg-gray-950">
      <Navbar />
      <div className="mx-auto max-w-3xl p-6 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            &larr; Back to Notes
          </Link>

          {/* H1 ir nuoroda į istoriją, bet be params (kol kas) */}
          <div className="mt-4 flex items-end justify-between">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Edit Note</h1>
            {/* Nuorodą į istoriją perkeliame į EditForm, kur jau turime id */}
          </div>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse p-10 text-center font-medium text-gray-500">
              Loading note...
            </div>
          }
        >
          <EditForm params={params} />
        </Suspense>
      </div>
    </div>
  );
}
