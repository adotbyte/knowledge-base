import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Suspense } from 'react';
import Link from 'next/link';

// Importuojame Recharts komponentus
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function DashboardContent() {
  const userId = "admin";

  // 1. Pagrindinė statistika
  const [totalNotes, totalTags, totalAttachments, totalStorage] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.tag.count(),
    prisma.attachment.count({ where: { note: { userId } } }),
    prisma.attachment.aggregate({
      where: { note: { userId } },
      _sum: { size: true },
    }),
  ]);

  // 2. Aktyvumo grafiko duomenys (paskutinės 7 dienos)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentNotes = await prisma.note.findMany({
    where: { 
      userId,
      createdAt: { gte: sevenDaysAgo }
    },
    select: { createdAt: true },
  });

  // Grupuojame pagal dienas
  const activityMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' });
    activityMap.set(dateStr, 0);
  }

  recentNotes.forEach(note => {
    const dateStr = new Date(note.createdAt).toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' });
    if (activityMap.has(dateStr)) {
      activityMap.set(dateStr, activityMap.get(dateStr) + 1);
    }
  });

  const chartData = Array.from(activityMap.entries()).map(([date, count]) => ({
    date,
    notes: count,
  }));

  // 3. Populiariausios žymės
  const topTags = await prisma.tag.findMany({
    take: 5,
    include: {
      _count: {
        select: { notes: true }
      }
    },
    orderBy: {
      notes: { _count: 'desc' }
    }
  });

  const storageMB = (totalStorage._sum.size || 0) / (1024 * 1024);

  return (
    <div className="space-y-8">
      {/* 1. Kortelės */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Iš viso užrašų</h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalNotes}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-3xl mb-2">🏷️</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unikalios žymės</h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalTags}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-3xl mb-2">📎</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Failai</h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{totalAttachments}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-3xl mb-2">💾</div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Užimta vieta</h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{storageMB.toFixed(2)} MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Aktyvumo grafikas */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Aktyvumas (paskutinės 7 dienos)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="notes" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Top žymės */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Populiariausios žymės</h3>
          <div className="space-y-3">
            {topTags.length === 0 ? (
              <p className="text-gray-500 text-sm">Nėra žymių.</p>
            ) : (
              topTags.map((tag, index) => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
                    <Link href={`/?tag=${tag.name}`} className="font-bold text-blue-600 hover:underline">
                      #{tag.name}
                    </Link>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{tag._count.notes} užrašai</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your knowledge base at a glance</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Back to Notes
          </Link>
        </div>

        <Suspense fallback={
          <div className="text-center p-20 text-gray-500 animate-pulse font-medium">
            Loading dashboard...
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}