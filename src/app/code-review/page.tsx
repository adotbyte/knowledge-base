'use client';

import { useState } from 'react';
import { reviewCode } from '../actions';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Link from 'next/link';

export default function CodeReviewPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setReview(null);

    const formData = new FormData();
    formData.append('code', code);
    formData.append('language', language);

    try {
      const result = await reviewCode(formData);
      setReview(result);
    } catch (error) {
      setReview('Sorry, an error occurred while reviewing the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">AI Code Reviewer</h1>
            <p className="mt-1 text-sm text-gray-500">
              Paste your code and let AI find bugs, suggest improvements, and explain it.
            </p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Back to Notes
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT: Input Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="language"
                  className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
                >
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="bash">Bash</option>
                  <option value="sql">SQL</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="code"
                  className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
                >
                  Code
                </label>
                <textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  required
                  rows={20}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 font-bold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Analyzing...</span>
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
                    Review Code
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: AI Output */}
          <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {review ? (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <span>🤖</span> AI Review
                </h3>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <MarkdownRenderer content={review} />
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                <svg
                  className="mb-4 h-16 w-16 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <p className="text-sm font-medium">Paste some code and click "Review Code"</p>
                <p className="mt-2 text-xs">
                  AI will find bugs, suggest improvements, and explain it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
