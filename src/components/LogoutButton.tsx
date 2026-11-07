'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl'; // <-- Vertimams

export default function LogoutButton() {
  const t = useTranslations('Components'); // <-- Vertimų hook'as

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.log('NextAuth sesijos nebuvo, tęsiame...');
    }

    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      window.location.href = '/login';
    } else {
      window.location.href = `/cdn-cgi/access/logout?returnTo=https://${window.location.hostname}/login`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="cursor-pointer text-sm font-semibold text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
    >
      {t('signOut')}
    </button>
  );
}
