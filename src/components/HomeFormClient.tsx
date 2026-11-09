'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import MarkdownEditor from '@/components/MarkdownEditor';
import GenerateNoteButton from '@/components/GenerateNoteButton';
import { createNote } from '@/app/actions';
import FileDropzone from '@/components/FileDropzone';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export default function HomeFormClient() {
  const t = useTranslations('Home');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // ✅ Autosave hook'as
  const { clearAutosave } = useAutosave('autosave-new-note', { title, content, tags }, (data) => {
    if (data.title) setTitle(data.title);
    if (data.content) setContent(data.content);
    if (data.tags) setTags(data.tags);
    toast.info('Atkurtas neišsaugotas juodraštis!');
  });

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

    try {
      await createNote(formData);
      clearAutosave();
      setTitle('');
      setContent('');
      setTags('');
      setFiles([]);
      toast.success('Užrašas sėkmingai išsaugotas!');
    } catch (error) {
      console.error(error);
      toast.error('Nepavyko išsaugoti užrašo.');
    }
  };

  return (
    <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('addNewNote')}</h2>
        <GenerateNoteButton />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* ... (visi laukai: title, content, tags, files) ... */}

        {/* Laukai lieka tokie patys, kaip jūsų pateiktame kode */}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t('tagsPlaceholder')}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
            {t('attachments')}
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
