import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { notFound } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default async function SharedFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const file = await prisma.attachment.findUnique({
    where: { shareId: id, isPublic: true },
  });

  if (!file) {
    notFound();
  }

  // Nukreipiame į failo atsisiuntimo API
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
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
    </div>
  );
}