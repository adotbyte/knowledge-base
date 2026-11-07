'use client';

import { useState } from 'react';
import { explainCode } from '../actions'; // <-- Kviečiame explainCode
import MarkdownRenderer from '../../components/MarkdownRenderer';
import Link from 'next/link';

// <-- Funkcija privalo vadintis iš didžiosios raidės ir būti "export default"
export default function ExplainerPage() {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null); // <-- Pakeistas pavadinimas
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setExplanation(null);

    const formData = new FormData();
    formData.append('code', code);

    try {
      // <-- Kviečiame explainCode, o ne reviewCode
      const result = await explainCode(formData);
      setExplanation(result);
    } catch (error) {
      setExplanation('Sorry, an error occurred while explaining the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">AI Code Explainer</h1>
            <p className="mt-1 text-sm text-gray-500">
              Paste any code and AI will explain it to you like a mentor.
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
                  htmlFor="code"
                  className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
                >
                  Code
                </label>
                <textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your confusing code here..."
                  required
                  rows={20}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Explaining...</span>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Explain Code
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: AI Output */}
          <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {explanation ? (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <span>🤖</span> AI Explanation
                </h3>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <MarkdownRenderer content={explanation} />
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-sm font-medium">Paste some code and click "Explain Code"</p>
                <p className="mt-2 text-xs">AI will break it down line by line.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
