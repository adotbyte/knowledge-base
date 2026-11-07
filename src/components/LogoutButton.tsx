'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const handleLogout = async () => {
    // Išvalome NextAuth sesiją ir nukreipiame į prisijungimo puslapį
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="cursor-pointer text-sm font-semibold text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
    >
      Sign Out
    </button>
  );
}
