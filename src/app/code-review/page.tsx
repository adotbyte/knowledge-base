'use client';

import { useState } from 'react';
import { reviewCode } from '../actions';
import MarkdownRenderer from '../components/MarkdownRenderer';
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">AI Code Reviewer</h1>
            <p className="text-gray-500 text-sm mt-1">Paste your code and let AI find bugs, suggest improvements, and explain it.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">&larr; Back to Notes</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Input Form */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="language" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Language</label>
                <select 
                  id="language" 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm"
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
                <label htmlFor="code" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Code</label>
                <textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  required
                  rows={20}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !code.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Analyzing...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Review Code
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: AI Output */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[500px]">
            {review ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🤖</span> AI Review
                </h3>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <MarkdownRenderer content={review} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <p className="text-sm font-medium">Paste some code and click "Review Code"</p>
                <p className="text-xs mt-2">AI will find bugs, suggest improvements, and explain it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}