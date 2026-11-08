'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function DemoContent() {
  const t = useTranslations('Demo');

  // ✅ Techninis turinys įrašytas tiesiogiai (be t('...'))
  const demoNotes = [
    {
      id: '1',
      title: t('note1Title'),
      content: t.raw('note1Content'), // <-- NAUDOJAME t.raw()
      tags: [t('note1Tag1'), t('note1Tag2')],
    },
    {
      id: '2',
      title: t('note2Title'),
      content: t.raw('note2Content'), // <-- NAUDOJAME t.raw()
      tags: [t('note2Tag1'), t('note2Tag2')],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans dark:bg-gray-950">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/20">
          <h1 className="text-2xl font-black text-blue-800 dark:text-blue-300">{t('title')}</h1>
          <p className="mt-2 text-blue-600 dark:text-blue-400">{t('subtitle')}</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700"
          >
            {t('loginButton')}
          </Link>
        </div>

        <div className="space-y-4">
          {demoNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{note.title}</h2>
              <div className="mt-4 rounded-xl bg-gray-50 p-4 font-mono text-sm dark:bg-gray-950">
                <pre className="whitespace-pre-wrap">{note.content}</pre>
              </div>
              <div className="mt-3 flex gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
