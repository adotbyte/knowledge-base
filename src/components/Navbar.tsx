'use client';

import { useState, Suspense } from 'react';
import { Link, usePathname } from '@/i18n/routing'; // <-- Naudojame next-intl Link
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl'; // <-- Vertimams
import ExportButton from '@/components/ExportButton';
import ThemeToggle from '@/components/ThemeToggle';
import LogoutButton from '@/components/LogoutButton';
import dynamic from 'next/dynamic';

// Dinaminis LanguageSwitcher įkėlimas (kad nebreakintų build)
const LanguageSwitcher = dynamic(() => import('@/components/LanguageSwitcher'), {
  ssr: false,
  loading: () => (
    <div className="h-8 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
  ),
});

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Navigation'); // <-- Vertimų hook'as
  const pathname = usePathname();

  // 1. TIK ADMINUI MATOMOS NUORODOS
  const ADMIN_EMAIL = 'adotbyte@gmail.com';
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const adminLinks = [
    { name: t('dashboard'), href: '/dashboard' },
    { name: t('docker'), href: '/docker' },
    { name: t('status'), href: '/status' },
  ];

  // 2. VISIEMS PRISIJUNGUSIEMS MATOMOS NUORODOS
  const userLinks = [
    { name: t('codeReview'), href: '/code-review' },
    { name: t('configGen'), href: '/config-generator' },
    { name: t('explainer'), href: '/explainer' },
    { name: t('publicView'), href: '/public' },
  ];

  // Sujungiame: admin mato viską, paprastas vartotojas - tik AI įrankius
  const links = isAdmin ? [...adminLinks, ...userLinks] : userLinks;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logotipas */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-black text-white">
            K
          </div>
          <h1 className="hidden text-xl font-black tracking-tight text-gray-900 sm:block dark:text-white">
            Knowledge Base
          </h1>
        </Link>

        {/* Desktop meniu */}
        <div className="hidden items-center gap-2 md:flex md:gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                pathname === link.href
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Suspense
            fallback={
              <div className="h-8 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
            }
          >
            <LanguageSwitcher />
          </Suspense>
          <ThemeToggle />
          <ExportButton />
          {session && <LogoutButton />}
        </div>

        {/* Mobile meniu mygtukas */}
        <div className="flex items-center gap-2 md:hidden">
          <Suspense
            fallback={
              <div className="h-8 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
            }
          >
            <LanguageSwitcher />
          </Suspense>
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile išskleidžiamas meniu */}
      {isOpen && (
        <div className="flex flex-col gap-4 border-t border-gray-100 bg-white px-6 py-4 shadow-lg md:hidden dark:border-gray-800 dark:bg-gray-900">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-base font-semibold text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <ExportButton />
            {session && <LogoutButton />}
          </div>
        </div>
      )}
    </nav>
  );
}
