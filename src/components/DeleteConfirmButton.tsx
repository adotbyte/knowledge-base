'use client';

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl'; // <-- Vertimams

export default function DeleteConfirmButton({ children }: { children: ReactNode }) {
  const t = useTranslations('Components'); // <-- Vertimų hook'as
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mygtukas, kuris atidaro modalinį langą */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1 text-gray-400 transition-colors hover:text-red-500"
        title={t('delete')} // <-- VERTIMAS
      >
        {children}
      </button>

      {/* Modalinis langas */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl duration-200 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {t('confirmDeleteTitle')} {/* <-- VERTIMAS */}
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {t('confirmDeleteDescription')} {/* <-- VERTIMAS */}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t('cancel')} {/* <-- VERTIMAS */}
              </button>

              <button
                type="submit"
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600"
              >
                {t('confirmDeleteButton')} {/* <-- VERTIMAS */}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
