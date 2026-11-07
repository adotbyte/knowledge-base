'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { exportNotes } from '@/app/actions';

export default function ExportButton() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!isLoggedIn) return; // Apsauga, jei bandoma apeiti

    setIsExporting(true);
    try {
      const markdown = await exportNotes();

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Nepavyko eksportuoti. Prašome prisijungti.');
    } finally {
      setIsExporting(false);
    }
  };

  // 1. Jei sesija dar kraunasi, rodome neaktyvų mygtuką
  if (status === 'loading') {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-500"
      >
        Kraunama...
      </button>
    );
  }

  // 2. Jei vartotojas neprisijungęs, rodome gražią nuorodą į prisijungimą
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
        title="Norėdami eksportuoti, prisijunkite"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Prisijungti
      </Link>
    );
  }

  // 3. Jei prisijungęs, rodome įprastą eksporto mygtuką
  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"
    >
      {isExporting ? (
        <span className="animate-pulse">Exporting...</span>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export All
        </>
      )}
    </button>
  );
}
