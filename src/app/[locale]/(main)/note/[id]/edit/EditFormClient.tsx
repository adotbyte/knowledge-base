'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import MarkdownEditor from '@/components/MarkdownEditor';
import { updateNote } from '@/app/actions';

interface EditFormClientProps {
  note: {
    id: string;
    title: string;
    content: string;
    tags: string;
    attachments: { id: string; name: string; url: string }[];
  };
  translations: {
    viewHistory: string;
    title: string;
    content: string;
    tags: string;
    tagsPlaceholder: string;
    addAttachments: string;
    currentAttachments: string;
    updateNote: string;
  };
}

export default function EditFormClient({ note, translations }: EditFormClientProps) {
  const [content, setContent] = useState(note.content);

  // ✅ updateNote.bind – serverinė funkcija, kuri priima note.id
  const updateNoteWithId = updateNote.bind(null, note.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href={`/note/${note.id}/history`}
          className="flex items-center gap-1 text-sm font-bold text-purple-600 hover:underline"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {translations.viewHistory}
        </Link>
      </div>

      <form
        action={updateNoteWithId}
        className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {translations.title}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={note.title}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {translations.content}
          </label>
          {/* ✅ Paslėptas input, kad Server Action gautų turinį */}
          <input type="hidden" name="content" value={content} />
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder={translations.tagsPlaceholder}
            minHeight="400px"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {translations.tags}
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            defaultValue={note.tags}
            placeholder={translations.tagsPlaceholder}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="pointer-events-none relative z-10 mt-2">
          <label
            htmlFor="files"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {translations.addAttachments}
          </label>
          <input
            type="file"
            id="files"
            name="files"
            multiple
            className="pointer-events-auto w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm text-gray-900 transition-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
          />
        </div>

        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              {translations.currentAttachments}
            </label>
            <div className="flex flex-wrap gap-2">
              {note.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    📎 {file.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="mt-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 dark:shadow-none"
        >
          {translations.updateNote}
        </button>
      </form>
    </div>
  );
}
