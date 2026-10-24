'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StatusPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/system-stats')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.data);
            setLoading(false);
          }
        })
        .catch(console.error);
    };

    fetchStats(); // Pirmas paleidimas
    const interval = setInterval(fetchStats, 5000); // Kas 5 sekundes

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading System Stats...</div>;
  if (!stats) return <div className="p-10 text-center text-red-500">Failed to load stats.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Live System Status</h1>
            <p className="text-gray-500 text-sm mt-1">Updates every 5 seconds</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">&larr; Back to Notes</Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">⏱️</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Uptime</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.uptimeDays} days</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">🧠</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Load</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.load}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">💾</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Disk</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.diskUsage}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">🐳</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Containers</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.containers.filter((c: any) => c.state === 'running').length} / {stats.containers.length}
            </p>
          </div>
        </div>

        {/* Memory Bar */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">RAM Usage</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{stats.memory.used} used / {stats.memory.total} total</span>
            <span className="text-green-600">{stats.memory.free} free</span>
          </div>
        </div>

        {/* Docker Containers List */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Docker Containers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.containers.map((c: any) => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{c.name}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  c.state === 'running' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {c.state.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}