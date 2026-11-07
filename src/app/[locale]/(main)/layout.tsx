import { Suspense } from 'react';
import NavbarWrapper from './NavbarWrapper';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense
        fallback={
          <div className="h-16 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"></div>
        }
      >
        <NavbarWrapper />
      </Suspense>
      <main>{children}</main>
    </>
  );
}
