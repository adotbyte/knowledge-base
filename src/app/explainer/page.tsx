'use client';

import { useState } from 'react';
import { explainCode } from '../actions'; // <-- Kviečiame explainCode
import MarkdownRenderer from '../components/MarkdownRenderer';
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">AI Code Explainer</h1>
            <p className="text-gray-500 text-sm mt-1">Paste any code and AI will explain it to you like a mentor.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">&larr; Back to Notes</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Form */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="code" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Code</label>
                <textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your confusing code here..."
                  required
                  rows={20}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm text-gray-900 dark:text-white resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !code.trim()}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Explaining...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Explain Code
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: AI Output */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[500px]">
            {explanation ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🤖</span> AI Explanation
                </h3>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <MarkdownRenderer content={explanation} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm font-medium">Paste some code and click "Explain Code"</p>
                <p className="text-xs mt-2">AI will break it down line by line.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}