'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl'; // <-- Vertimams
import { generateNote } from '../app/actions';

export default function GenerateNoteButton() {
  const t = useTranslations('Components'); // <-- Vertimų hook'as
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);

    const formData = new FormData(e.currentTarget);
    try {
      await generateNote(formData);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert(t('generateError')); // <-- VERTIMAS
    } finally {
      setIsGenerating(false);
    }
  };

  // Modalinis langas, kuris bus įterptas tiesiai į <body>, apeinant visus tėvinius CSS
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl duration-200 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span>✨</span> {t('aiNoteGenerator')} {/* <-- VERTIMAS */}
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {t('aiNoteGeneratorDescription')} {/* <-- VERTIMAS */}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="topic"
            placeholder={t('topicPlaceholder')} // <-- VERTIMAS
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            autoFocus
          />

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t('cancel')} {/* <-- VERTIMAS */}
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="animate-pulse">{t('generating')}</span>
              ) : (
                t('generate')
              )}{' '}
              {/* <-- VERTIMAS */}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {t('generateWithAi')} {/* <-- VERTIMAS */}
      </button>

      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}
