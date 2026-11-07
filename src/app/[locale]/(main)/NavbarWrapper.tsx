'use client';

import dynamic from 'next/dynamic';

// ✅ DINAMINIS Navbar ĮKĖLIMAS
const Navbar = dynamic(() => import('@/components/Navbar'), {
  ssr: false,
  loading: () => (
    <div className="h-16 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"></div>
  ),
});

export default function NavbarWrapper() {
  return <Navbar />;
}
