import Link from 'next/link';
import { auth, signOut } from '.././auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createNote, deleteNote, toggleShare, summarizeNote, improveNote } from './actions';
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

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// --- 1. APSAUGOTAS TURINYS (Server Component) ---
async function ProtectedContent({ searchParams }: { searchParams: Promise<{ q?: string; tag?: string }> }) {
  // 1. Cloudflare Access jau mus apsaugojo, todėl naudojame fiksuotą vartotoją
  const userId = "admin"; 

  const { q, tag } = await searchParams;
  const searchQuery = q?.replace('#', '').trim();

  const notes = await prisma.note.findMany({
    where: { 
      userId: userId, // <-- Pakeista iš session.user.id į userId
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Create Form */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Note</h2>
            <GenerateNoteButton />
          </div>
          <form action={createNote} className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Title</label>
              <input type="text" id="title" name="title" placeholder="e.g., Docker Compose Setup" required className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label htmlFor="content" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Content</label>
              <textarea id="content" name="content" placeholder="Paste your code, config, or notes here..." required rows={8} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm text-gray-900 dark:text-white resize-none" />
            </div>
            <div>
              <label htmlFor="tags" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Tags (comma separated)</label>
              <input type="text" id="tags" name="tags" placeholder="e.g., Docker, Linux, Config" className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white text-sm" />
            </div>
            <div className="relative z-10 pointer-events-none mt-2">
              <label htmlFor="files" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Attachments</label>
              <input type="file" id="files" name="files" multiple className="pointer-events-auto w-full p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700 transition-none" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none mt-2">Save Note</button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Notes List */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Your Notes <span className="text-blue-600 dark:text-blue-400">({notes.length})</span>
          </h2>
          
          {tag && (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
              <span>Filtering by: #{tag}</span>
              <Link href="/" className="hover:text-blue-900 dark:hover:text-white" title="Clear filter">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </Link>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No notes found. Create one or try a different search!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{note.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    <CopyButton text={note.content} />
                    
                    <Link href={`/note/${note.id}/edit`} className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="Edit note">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>

                    {/* AI SUMMARIZE */}
                    <ActionButton 
                      action={summarizeNote} 
                      className="text-gray-400 hover:text-purple-500 transition-colors p-1"
                      title="Summarize with AI"
                    >
                      <input type="hidden" name="id" value={note.id} />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </ActionButton>

                    {/* AI IMPROVE */}
                    <ActionButton 
                      action={improveNote} 
                      className="text-gray-400 hover:text-amber-500 transition-colors p-1"
                      title="Improve with AI"
                    >
                      <input type="hidden" name="id" value={note.id} />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 4l5 5M6 13l5-5m-5 5l2 2m-2-2l-2-2m7 7l5 5m-5-5l-2-2m2 2l2 2M9 9l6 6M12 3v2m0 14v2M3 12h2m14 0h2" />
                      </svg>
                    </ActionButton>

                    {/* SHARE */}
                    <form action={toggleShare}>
                      <input type="hidden" name="id" value={note.id} />
                      <input type="hidden" name="isPublic" value={String(note.isPublic)} />
                      <button type="submit" className={`transition-colors p-1 ${note.isPublic ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`} title={note.isPublic ? "Stop sharing" : "Share this note"}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                    </form>

                    {/* DELETE */}
                    <form action={deleteNote}>
                      <input type="hidden" name="id" value={note.id} />
                      <DeleteConfirmButton>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </DeleteConfirmButton>
                    </form>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <MarkdownRenderer content={note.content} />
                </div>

                {/* ATTACHMENTS */}
                {note.attachments && note.attachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.attachments.map((file: any) => (
                      <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        📎 {file.name}
                      </a>
                    ))}
                  </div>
                )}

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {note.tags.map((tag) => (
                      <Link key={tag.id} href={`/?tag=${tag.name}`} className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-md transition-colors cursor-pointer">
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}
                
                {note.isPublic && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-green-700 dark:text-green-400 font-mono truncate mr-2">
                      /share/{note.shareId}
                    </span>
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">Public</span>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* RAG PAIEŠKA GRĮŽTA! */}
        <AISearch />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white hidden md:block">Your Notes</h2>
          <div className="w-full md:max-w-md md:ml-4">
             <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>}>
                <SearchBar />
             </Suspense>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-20 text-gray-500 animate-pulse font-medium">
            Loading your knowledge base...
          </div>
        }>
          <ProtectedContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}