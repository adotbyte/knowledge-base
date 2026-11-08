'use client';

import { useState, Suspense, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import ExportButton from '@/components/ExportButton';
import ThemeToggle from '@/components/ThemeToggle';
import LogoutButton from '@/components/LogoutButton';
import dynamic from 'next/dynamic';

const LanguageSwitcher = dynamic(() => import('@/components/LanguageSwitcher'), {
  ssr: false,
  loading: () => (
    <div className="h-8 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
  ),
});

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  const ADMIN_EMAIL = 'adotbyte@gmail.com';
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const adminLinks = [
    { name: t('dashboard'), href: '/dashboard' },
    { name: t('docker'), href: '/docker' },
    { name: t('status'), href: '/status' },
  ];

  const userLinks = [
    { name: t('codeReview'), href: '/code-review' },
    { name: t('configGen'), href: '/config-generator' },
    { name: t('explainer'), href: '/explainer' },
    { name: t('publicView'), href: '/public' },
  ];

  const links = isAdmin ? [...adminLinks, ...userLinks] : userLinks;

  // Uždaryti mobilų meniu pasikeitus maršrutui
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logotipas */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-black text-white">
            K
          </div>
          <h1 className="hidden text-xl font-black tracking-tight text-gray-900 sm:block dark:text-white">
            Knowledge Base
          </h1>
        </Link>

        {/* Desktop meniu (nuo 768px) */}
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
          {session && (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
              title="Profilis"
            >
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profilis"
                  className="h-7 w-7 rounded-full border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
              <span className="hidden lg:block">{session.user?.name || 'Profilis'}</span>
            </Link>
          )}
          {session && <LogoutButton />}
        </div>

        {/* Mobile meniu mygtukas (iki 768px) */}
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
            aria-label="Toggle menu"
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

      {/* Mobile išskleidžiamas meniu su animacija */}
      <div
        className={`fixed inset-x-0 top-16 z-40 transform border-t border-gray-100 bg-white shadow-lg transition-transform duration-300 ease-in-out md:hidden dark:border-gray-800 dark:bg-gray-900 ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex max-h-[calc(100vh-4rem)] flex-col gap-4 overflow-y-auto px-6 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-base font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                pathname === link.href
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {session && (
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-semibold text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profilis"
                  className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
              <span>Profilis</span>
            </Link>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <ExportButton />
            {session && <LogoutButton />}
          </div>
        </div>
      </div>

      {/* Fono uždengimas (overlay) mobile meniu atveju */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}
