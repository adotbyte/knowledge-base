import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['lt', 'en'],
  defaultLocale: 'lt',
  localeDetection: true,
});

// ✅ Sukuriame ir eksportuojame Link, useRouter, usePathname
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
