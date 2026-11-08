'use client';
import { signOut } from 'next-auth/react';
import { deleteAccount } from '@/app/actions';
import { useTranslations } from 'next-intl';

export default function DeleteAccountButton() {
  const t = useTranslations('Profile');

  const handleDelete = async () => {
    if (confirm(t('confirmDeleteAccount'))) {
      await deleteAccount();
      await signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
    >
      {t('deleteAccount')}
    </button>
  );
}
