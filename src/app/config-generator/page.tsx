'use client';

import { useState } from 'react';
import { generateConfig } from '../actions';
import MarkdownRenderer from '../../components/MarkdownRenderer';
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
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              AI Config Generator
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Generate Docker & Server configs instantly.
            </p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Back
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1 dark:border-gray-800 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  Service Name
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g., Navidrome, Nginx, PostgreSQL"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  Requirements (optional)
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g., Needs HTTPS, connect to existing Postgres..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !service.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? <span className="animate-pulse">Generating...</span> : 'Generate Config'}
              </button>
            </form>
          </div>

          <div className="min-h-[400px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
            {result ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <MarkdownRenderer content={result} />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <p className="text-sm font-medium">Your generated config will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
