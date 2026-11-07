'use client';

import { useState } from 'react';
import { askKnowledgeBase } from '../app/actions';
import MarkdownRenderer from './MarkdownRenderer';

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      const result = await askKnowledgeBase(query);
      setAnswer(result);
    } catch (error) {
      setAnswer('Sorry, an error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI anything about your notes (e.g., 'How do I configure Docker?')"
            className="flex-1 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Thinking...</span>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Ask AI
              </>
            )}
          </button>
        </form>
      </div>
      {/* Loading State */}
      {loading && (
        <div className="animate-pulse p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>
      )}
      {answer && (
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h3 className="font-bold text-gray-900 dark:text-white">AI Answer</h3>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <MarkdownRenderer content={answer} />
          </div>
        </div>
      )}
    </div>
  );
}
