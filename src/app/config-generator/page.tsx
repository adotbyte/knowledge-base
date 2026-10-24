'use client';

import { useState } from 'react';
import { generateConfig } from '../actions';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Link from 'next/link';

export default function ConfigGeneratorPage() {
  const [service, setService] = useState('');
  const [requirements, setRequirements] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim()) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('serviceName', service);
    formData.append('requirements', requirements);

    try {
      const res = await generateConfig(formData);
      setResult(res);
    } catch (error) {
      setResult('Failed to generate configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">AI Config Generator</h1>
            <p className="text-gray-500 text-sm mt-1">Generate Docker & Server configs instantly.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">&larr; Back</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Service Name</label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g., Navidrome, Nginx, PostgreSQL"
                  required
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Requirements (optional)</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g., Needs HTTPS, connect to existing Postgres..."
                  rows={4}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !service.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-pulse">Generating...</span> : 'Generate Config'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[400px]">
            {result ? (
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
                <MarkdownRenderer content={result} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-sm font-medium">Your generated config will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}