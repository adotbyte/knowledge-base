'use client';

import { useState } from 'react';
import { askKnowledgeBase } from '../actions';
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
    <div className="mb-10 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI anything about your notes (e.g., 'How do I configure Docker?')"
            className="flex-1 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Thinking...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ask AI
              </>
            )}
          </button>
        </form>
      </div>
      {/* Loading State */}
      {loading && (
        <div className="p-6 animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🤖</span>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
          </div>
        </div>
      )}
      {answer && (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🤖</span>
            <h3 className="font-bold text-gray-900 dark:text-white">AI Answer</h3>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <MarkdownRenderer content={answer} />
          </div>
        </div>
      )}
    </div>
  );
}