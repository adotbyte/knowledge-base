import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Knowledge Base',
  description: 'My personal knowledge base',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg?v=2', // <-- PRIDĖTA FAVICON
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          scriptProps={{ 'data-cfasync': 'false' }}
        >
          <SessionProvider>
            {children}
            <Toaster position="bottom-right" richColors />
            <ServiceWorkerRegistration />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
