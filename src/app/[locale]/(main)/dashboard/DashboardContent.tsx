import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Link } from '@/i18n/routing';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default async function DashboardContent({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await connection(); // Next.js 16 reikalavimas

  const session = await auth();

  // 1. Patikriname, ar vartotojas prisijungęs
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. TIKRINAME, AR TAI ADMINISTRATORIUS
  const ADMIN_EMAIL = 'adotbyte@gmail.com'; // <-- Įrašykite savo el. paštą!
  if (session.user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  const userId = session.user.id;

  // 3. Nustatome kalbą ir gauname vertimus
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Dashboard');

  // 4. Pagrindinė statistika
  const [totalNotes, totalTags, totalAttachments, totalStorage] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.tag.count(),
    prisma.attachment.count({ where: { note: { userId } } }),
    prisma.attachment.aggregate({
      where: { note: { userId } },
      _sum: { size: true },
    }),
  ]);

  // 5. Populiariausios žymės
  const topTags = await prisma.tag.findMany({
    take: 5,
    include: {
      _count: {
        select: { notes: true },
      },
    },
    orderBy: {
      notes: { _count: 'desc' },
    },
  });

  // 6. Paskutiniai užrašai
  const recentNotes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, createdAt: true },
  });

  const storageMB = (totalStorage._sum.size || 0) / (1024 * 1024);

  return (
    <div className="space-y-8">
      {/* 1. Kortelės */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">📝</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            {t('totalNotes')}
          </h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{totalNotes}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">🏷️</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            {t('totalTags')}
          </h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">{totalTags}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">📎</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            {t('totalFiles')}
          </h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">
            {totalAttachments}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-3xl">💾</div>
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
            {t('storageUsed')}
          </h3>
          <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">
            {storageMB.toFixed(2)} MB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 2. Paskutiniai užrašai */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            {t('recentNotes')}
          </h3>
          <div className="space-y-3">
            {recentNotes.length === 0 ? (
              <p className="text-sm text-gray-500">{t('noNotes')}</p>
            ) : (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <Link
                    href={`/note/${note.id}/edit`}
                    className="mr-4 truncate font-semibold text-gray-800 hover:text-blue-600 dark:text-gray-200"
                  >
                    {note.title}
                  </Link>
                  <span className="text-xs whitespace-nowrap text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Top žymės */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">{t('topTags')}</h3>
          <div className="space-y-3">
            {topTags.length === 0 ? (
              <p className="text-sm text-gray-500">{t('noTags')}</p>
            ) : (
              topTags.map((tag, index) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-400">#{index + 1}</span>
                    <Link
                      href={`/?tag=${tag.name}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      #{tag.name}
                    </Link>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t('notesCount', { count: tag._count.notes })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
