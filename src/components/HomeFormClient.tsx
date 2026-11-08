'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import MarkdownEditor from '@/components/MarkdownEditor';
import GenerateNoteButton from '@/components/GenerateNoteButton';
import { createNote } from '@/app/actions';

export default function HomeFormClient() {
  const t = useTranslations('Home');
  const [content, setContent] = useState('');

  return (
    <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('addNewNote')}</h2>
        <GenerateNoteButton />
      </div>

      <form action={createNote} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {t('title')}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder={t('titlePlaceholder')}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {t('content')}
          </label>
          {/* ✅ Paslėptas input, kad Server Action gautų turinį */}
          <input type="hidden" name="content" value={content} />
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder={t('contentPlaceholder')}
            minHeight="200px"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {t('tags')}
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            placeholder={t('tagsPlaceholder')}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="pointer-events-none relative z-10 mt-2">
          <label
            htmlFor="files"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {t('attachments')}
          </label>
          <input
            type="file"
            id="files"
            name="files"
            multiple
            className="pointer-events-auto w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-900 transition-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 dark:shadow-none"
        >
          {t('saveNote')}
        </button>
      </form>
    </div>
  );
}
