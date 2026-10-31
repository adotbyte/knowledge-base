import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  createNote,
  deleteNote,
  toggleShare,
  summarizeNote,
  improveNote,
  toggleFileShare,
} from './actions';
import { Suspense } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer';
import CopyButton from './components/CopyButton';
import ExportButton from './components/ExportButton';
import ThemeToggle from './components/ThemeToggle';
import GenerateNoteButton from './components/GenerateNoteButton';
import DeleteConfirmButton from './components/DeleteConfirmButton';
import AISearch from './components/AISearch';
import ActionButton from './components/ActionButton';
import Navbar from './components/Navbar';
import SearchBar from './SearchBar';
import CommandPalette from './components/CommandPalette';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// --- 1. APSAUGOTAS TURINYS (Server Component) ---
async function ProtectedContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  // 1. Cloudflare Access jau mus apsaugojo, todėl naudojame fiksuotą vartotoją
  const userId = 'admin';

  const { q, tag } = await searchParams;
  const searchQuery = q?.replace('#', '').trim();

  const notes = await prisma.note.findMany({
    where: {
      userId: userId,
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { some: { name: { contains: searchQuery, mode: 'insensitive' } } } },
        ],
      }),
      ...(tag && {
        tags: { some: { name: tag } },
      }),
    },
    include: { tags: true, attachments: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* LEFT COLUMN: Create Form */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Note</h2>
            <GenerateNoteButton />
          </div>
          <form action={createNote} className="flex flex-col gap-4">
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
                placeholder="e.g., Docker Compose Setup"
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
                placeholder="Paste your code, config, or notes here..."
                required
                rows={8}
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
                placeholder="e.g., Docker, Linux, Config"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>
            <div className="pointer-events-none relative z-10 mt-2">
              <label
                htmlFor="files"
                className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
              >
                Attachments
              </label>
              <input
                type="file"
                id="files"
                name="files"
                multiple
                className="pointer-events-auto w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-900 transition-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 dark:shadow-none"
            >
              Save Note
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Notes List */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Your Notes <span className="text-blue-600 dark:text-blue-400">({notes.length})</span>
          </h2>

          {tag && (
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <span>Filtering by: #{tag}</span>
              <Link
                href="/"
                className="hover:text-blue-900 dark:hover:text-white"
                title="Clear filter"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
              <p className="text-gray-500 dark:text-gray-400">
                No notes found. Create one or try a different search!
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{note.title}</h3>

                  <div className="flex items-center gap-2">
                    <CopyButton text={note.content} />

                    <Link
                      href={`/note/${note.id}/edit`}
                      className="p-1 text-gray-400 transition-colors hover:text-blue-500"
                      title="Edit note"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>

                    {/* AI SUMMARIZE */}
                    <ActionButton
                      action={summarizeNote}
                      className="p-1 text-gray-400 transition-colors hover:text-purple-500"
                      title="Summarize with AI"
                    >
                      <input type="hidden" name="id" value={note.id} />
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </ActionButton>

                    {/* AI IMPROVE */}
                    <ActionButton
                      action={improveNote}
                      className="p-1 text-gray-400 transition-colors hover:text-amber-500"
                      title="Improve with AI"
                    >
                      <input type="hidden" name="id" value={note.id} />
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 4l5 5M6 13l5-5m-5 5l2 2m-2-2l-2-2m7 7l5 5m-5-5l-2-2m2 2l2 2M9 9l6 6M12 3v2m0 14v2M3 12h2m14 0h2"
                        />
                      </svg>
                    </ActionButton>

                    {/* SHARE */}
                    <form action={toggleShare}>
                      <input type="hidden" name="id" value={note.id} />
                      <input type="hidden" name="isPublic" value={String(note.isPublic)} />
                      <button
                        type="submit"
                        className={`p-1 transition-colors ${note.isPublic ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                        title={note.isPublic ? 'Stop sharing' : 'Share this note'}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                      </button>
                    </form>

                    {/* DELETE */}
                    <form action={deleteNote}>
                      <input type="hidden" name="id" value={note.id} />
                      <DeleteConfirmButton>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </DeleteConfirmButton>
                    </form>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                  <MarkdownRenderer content={note.content} />
                </div>

                {/* ATTACHMENTS */}
                {note.attachments && note.attachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.attachments.map((file: any) => (
                      <div
                        key={file.id}
                        className="group/file flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          📎 {file.name}
                        </a>

                        {/* SHARE FILE BUTTON */}
                        <form action={toggleFileShare}>
                          <input type="hidden" name="id" value={file.id} />
                          <input type="hidden" name="isPublic" value={String(file.isPublic)} />
                          <button
                            type="submit"
                            className={`p-0.5 transition-colors ${file.isPublic ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                            title={file.isPublic ? 'Stop sharing' : 'Share this file'}
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                          </button>
                        </form>

                        {file.isPublic && (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-green-600 dark:text-green-400">
                              /share-file/{file.shareId}
                            </span>
                            <CopyButton
                              text={`https://knowledge.morkunas.info/share-file/${file.shareId}`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/?tag=${tag.name}`}
                        className="cursor-pointer rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {note.isPublic && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="truncate font-mono text-xs text-green-700 dark:text-green-400">
                        /share/{note.shareId}
                      </span>
                      <CopyButton text={`https://knowledge.morkunas.info/share/${note.shareId}`} />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-green-600 uppercase dark:text-green-500">
                      Public
                    </span>
                  </div>
                )}

                <p className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {new Date(note.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- 2. PAGRINDINIS PUSLAPIS (Synchronous, no auth here) ---
export default function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans dark:bg-gray-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* RAG PAIEŠKA GRĮŽTA! */}
        <AISearch />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="hidden text-2xl font-black text-gray-900 md:block dark:text-white">
            Your Notes
          </h2>
          <div className="w-full md:ml-4 md:max-w-md">
            <Suspense
              fallback={
                <div className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
              }
            >
              <SearchBar />
            </Suspense>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex animate-pulse items-center justify-center p-20 font-medium text-gray-500">
              Loading your knowledge base...
            </div>
          }
        >
          <ProtectedContent searchParams={searchParams} />
        </Suspense>
      </main>
      <CommandPalette />
    </div>
  );
}
