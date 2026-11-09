'use client';

import dynamic from 'next/dynamic';

const AISearch = dynamic(() => import('@/components/AISearch'), {
  ssr: false,
  loading: () => (
    <div className="mb-10 h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"></div>
  ),
});

const SearchBar = dynamic(() => import('@/components/SearchBar'), {
  ssr: false,
  loading: () => <div className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>,
});

const CommandPalette = dynamic(() => import('@/components/CommandPalette'), {
  ssr: false,
});

// ✅ Apibrėžiame props tipą
interface HomeClientProps {
  translations: {
    yourNotes: string;
  };
}

export default function HomeClient({ translations }: HomeClientProps) {
  return (
    <>
      <AISearch />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="hidden text-2xl font-black text-gray-900 md:block dark:text-white">
          {translations.yourNotes} {/* <-- Naudojame props, ne useTranslations */}
        </h2>
        <div className="w-full md:ml-4 md:max-w-md">
          <SearchBar />
        </div>
      </div>
      <CommandPalette />
    </>
  );
}
