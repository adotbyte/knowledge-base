'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import ExportButton from './ExportButton';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/dashboard', color: 'hover:text-blue-600' },
    { name: 'Live Status', href: '/status', color: 'hover:text-green-600' },
    { name: 'Code Reviewer', href: '/code-review', color: 'hover:text-purple-600' },
    { name: 'Config Gen', href: '/config-generator', color: 'hover:text-emerald-600' },
    { name: 'Explainer', href: '/explainer', color: 'hover:text-orange-600' },
  ];

  return (
    <div className="md:hidden">
      {/* Mygtukas atidaryti meniu */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Išskleidžiamas meniu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-semibold text-gray-700 dark:text-gray-300 ${link.color} transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ExportButton />
            </div>
            <form action={async () => {
              'use server';
              // Čia turėtų būti tavo signOut logika, bet kadangi dabar naudojame Cloudflare Access,
              // galime tiesiog palikti nuorodą atgal į Cloudflare logout, arba tiesiog mygtuką.
            }}>
              <button className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}