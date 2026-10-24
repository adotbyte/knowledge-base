import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

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
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center max-w-md w-full">
      <div className="text-5xl mb-4">📎</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shared File</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{file.name}</p>
      
      <a 
        href={file.url} 
        download={file.name}
        className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
      >
        Download File
      </a>
    </div>
  );
}

// 2. Pagrindinis puslapis (sinchroninis, be await params)
export default function SharedFilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Go to Knowledge Base
          </Link>
        </div>
        
        <Suspense fallback={
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          </div>
        }>
          <SharedFileContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}