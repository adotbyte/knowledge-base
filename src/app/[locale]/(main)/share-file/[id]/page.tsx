export const instant = false;

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Link } from '@/i18n/routing';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// 1. Atskiras komponentas, kuris priima params ir krauna duomenis
async function SharedFileContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <-- params išsprendžiami ČIA (Suspense viduje)

  const file = await prisma.attachment.findUnique({
    where: { shareId: id, isPublic: true },
  });

  if (!file) {
    notFound();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 text-5xl">📎</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Shared File</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>

      <a
        href={file.url}
        download={file.name}
        className="inline-block w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-700"
      >
        Download File
      </a>
    </div>
  );
}

// 2. Pagrindinis puslapis (sinchroninis, be await params)
export default function SharedFilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="https://knowledge.morkunas.info"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            &larr; Go to Knowledge Base
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <div className="flex animate-pulse flex-col items-center">
                <div className="mb-4 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800"></div>
              </div>
            </div>
          }
        >
          <SharedFileContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
