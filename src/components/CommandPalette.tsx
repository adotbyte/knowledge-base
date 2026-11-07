'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchNotes } from '../app/actions';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // 1. Klausomės Ctrl+K (arba Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // 2. Paieška realiuoju laiku
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await searchNotes(query);
          setResults(res);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 pt-[10vh] backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()} // Neleidžia užsidaryti paspaudus viduje
      >
        {/* Paieškos laukelis */}
        <div className="flex items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <svg
            className="mr-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes... (Press Esc to close)"
            className="w-full bg-transparent text-lg text-gray-900 placeholder-gray-400 outline-none dark:text-white"
            autoFocus
          />
          {isSearching && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          )}
        </div>

        {/* Rezultatai */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && query.trim().length > 0 && !isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">No notes found.</div>
          ) : results.length === 0 && query.trim().length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">Type to search...</div>
          ) : (
            results.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  router.push(`/note/${note.id}/edit`);
                  setIsOpen(false);
                }}
                className="group flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                    {note.title}
                  </span>
                  {/* Jei yra failų, parodome mažą ikoną */}
                  {note.attachments && note.attachments.length > 0 && (
                    <span className="text-xs text-gray-400">📎 {note.attachments.length}</span>
                  )}
                </div>
                <span className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                  {note.content.replace(/[#*`]/g, '')}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
