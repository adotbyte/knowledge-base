'use client';

import { useState, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import MarkdownEditor from '@/components/MarkdownEditor';
import FileDropzone from '@/components/FileDropzone';
import { updateNote } from '../../../../../actions';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

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
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags);
  const [files, setFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // ✅ Autosave hook'as
  const { clearAutosave } = useAutosave(
    `autosave-edit-${note.id}`,
    { title, content, tags },
    (data) => {
      if (data.title) setTitle(data.title);
      if (data.content) setContent(data.content);
      if (data.tags) setTags(data.tags);
      toast.info('Atkurtas neišsaugotas juodraštis!');
    }
  );

  // ✅ Ctrl + S išsaugo užrašą
  useKeyboardShortcut({ ctrlKey: true, key: 's' }, () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    files.forEach((file) => formData.append('files', file));
    setFiles([]);

    try {
      await updateNote(note.id, formData);
      clearAutosave();
      toast.success('Užrašas sėkmingai atnaujintas!');
    } catch (error) {
      console.error(error);
      toast.error('Nepavyko atnaujinti užrašo.');
    }
  };

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
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        {/* ... (visi laukai: title, content, tags, files) ... */}

        {/* Laukai lieka tokie patys, kaip jūsų pateiktame kode */}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300"
          >
            {translations.content}
          </label>
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
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={translations.tagsPlaceholder}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
            {translations.addAttachments}
          </label>
          <FileDropzone
            onFilesSelected={(newFiles) => setFiles((prev) => [...prev, ...newFiles])}
          />
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  📎 {file.name}
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
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
