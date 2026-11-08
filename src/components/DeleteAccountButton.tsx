'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { deleteAccount } from '@/app/actions';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function DeleteAccountButton() {
  const t = useTranslations('Profile');
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success(t('accountDeletedSuccess'));
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(t('deleteError'));
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
      >
        {t('deleteAccount')}
      </button>

      {/* ✅ GRAŽUS MODALINIS LANGAS */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {t('confirmDeleteTitle')}
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {t('confirmDeleteDescription')}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? t('deleting') : t('confirmDeleteButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
