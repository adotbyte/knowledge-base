'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExportButton from './ExportButton';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Docker', href: '/docker' },
    { name: 'Live Status', href: '/status' },
    { name: 'Code Reviewer', href: '/code-review' },
    { name: 'Config Gen', href: '/config-generator' },
    { name: 'Explainer', href: '/explainer' },
    { name: 'Public View', href: '/public' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logotipas */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">K</div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight hidden sm:block">Knowledge Base</h1>
        </Link>

        {/* Desktop meniu */}
        <div className="hidden md:flex items-center gap-2 md:gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
              {link.name}
            </Link>
          ))}
          <ThemeToggle />
          <ExportButton />
          <button 
            onClick={() => { window.location.href = '/cdn-cgi/access/logout'; }}
            className="text-sm font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile meniu mygtukas */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile išskleidžiamas meniu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex flex-col gap-4 shadow-lg">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
            <ExportButton />
            <button 
              onClick={() => { window.location.href = '/cdn-cgi/access/logout'; }}
              className="text-sm font-semibold text-red-500 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}