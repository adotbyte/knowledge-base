'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // Pakeičiame kalbos prefiksą URL'e (pvz., /lt/login -> /en/login)
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      <button
        onClick={() => switchLanguage('lt')}
        className={`rounded px-2 py-1 text-xs font-bold ${locale === 'lt' ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500'}`}
      >
        LT
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`rounded px-2 py-1 text-xs font-bold ${locale === 'en' ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500'}`}
      >
        EN
      </button>
    </div>
  );
}
