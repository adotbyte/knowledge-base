'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchNotes } from '../actions';

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
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Neleidžia užsidaryti paspaudus viduje
      >
        {/* Paieškos laukelis */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes... (Press Esc to close)"
            className="w-full bg-transparent outline-none text-gray-900 dark:text-white text-lg placeholder-gray-400"
            autoFocus
          />
          {isSearching && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Rezultatai */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && query.trim().length > 0 && !isSearching ? (
            <div className="p-4 text-center text-gray-500 text-sm">No notes found.</div>
          ) : results.length === 0 && query.trim().length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">Type to search...</div>
          ) : (
            results.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  router.push(`/note/${note.id}/edit`);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col gap-1 group"
              >
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {note.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {note.content.replace(/[#*`]/g, '')} {/* Nuimame markdown simbolius ištraukai */}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}