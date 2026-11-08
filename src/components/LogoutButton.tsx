'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function LogoutButton() {
  const t = useTranslations('Components');

  const handleLogout = async () => {
    // ✅ Teisingas būdas: iškviečiame next-auth signOut
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer text-sm font-semibold text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
    >
      {t('signOut')}
    </button>
  );
}
