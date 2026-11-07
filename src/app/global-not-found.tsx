import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">404</h1>
          <p className="mt-4 text-gray-500">Page not found</p>
          <Link
            href="/"
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </body>
    </html>
  );
}
