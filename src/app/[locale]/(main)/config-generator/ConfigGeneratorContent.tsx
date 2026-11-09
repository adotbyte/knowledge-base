'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { generateConfig } from '../../../actions'; // Pataisykite kelią, jei reikia
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Link } from '@/i18n/routing';
import { useSession } from 'next-auth/react';

export default function ConfigGeneratorContent() {
  const t = useTranslations('ConfigGenerator');
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;

  const [service, setService] = useState('');
  const [requirements, setRequirements] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !isLoggedIn) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('serviceName', service);
    formData.append('requirements', requirements);

    try {
      const res = await generateConfig(formData);
      setResult(res);
    } catch (error) {
      setResult(t('loginPrompt'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; {t('backToNotes')}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1 dark:border-gray-800 dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  {t('serviceName')}
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder={t('servicePlaceholder')}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  {t('requirements')}
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={t('requirementsPlaceholder')}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>

              {!isLoggedIn && status !== 'loading' && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-900/30 dark:bg-blue-900/20">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {t('loginPrompt')}
                  </p>
                  <Link
                    href="/login"
                    className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    {t('loginButton')}
                  </Link>
                </div>
              )}

              {isLoggedIn && (
                <button
                  type="submit"
                  disabled={loading || !service.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">{t('generating')}</span>
                  ) : (
                    t('generateButton')
                  )}
                </button>
              )}
            </form>
          </div>

          <div className="min-h-[400px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
            {result ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <MarkdownRenderer content={result} />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <p className="text-sm font-medium">{t('emptyState')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
