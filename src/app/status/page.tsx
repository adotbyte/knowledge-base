'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

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

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Atnaujiname kas 10 sek.
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Status...</div>;
  if (!stats) return <div className="p-10 text-center text-red-500">Failed to load stats.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">System Health</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time status of all projects and services.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">&larr; Back to Notes</Link>
        </div>

        {/* Svetainės */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {stats.websites.map((site: any) => (
            <div key={site.name} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{site.name}</h3>
                <p className="text-xs text-gray-500 mt-1">HTTP Status: {site.status || 'Error'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                site.status === 200 || site.status === 302 || site.status === 307 || site.status === 403
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {site.status === 200 || site.status === 302 || site.status === 307 || site.status === 403 ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          ))}
        </div>
                {/* UPTIME STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Portfolio Uptime</h3>
              <p className="text-xs text-gray-500 mt-1">Based on recent checks</p>
            </div>
            <span className={`text-2xl font-black ${
              stats.uptime.portfolio > 95 ? 'text-green-500' : 'text-red-500'
            }`}>
              {stats.uptime.portfolio}%
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Knowledge Base Uptime</h3>
              <p className="text-xs text-gray-500 mt-1">Based on recent checks</p>
            </div>
            <span className={`text-2xl font-black ${
              stats.uptime.knowledge > 95 ? 'text-green-500' : 'text-red-500'
            }`}>
              {stats.uptime.knowledge}%
            </span>
          </div>
        </div>

        {/* Sistemos resursai */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">⏱️</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Uptime</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.system.uptimeDays} days</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">🧠</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Load</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.system.load}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">💾</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Disk</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.system.diskUsage}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">🐳</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Containers</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.containers.filter((c: any) => c.state === 'running').length} / {stats.containers.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-xl mb-1">🛠️</div>
            <h3 className="text-xs font-bold text-gray-500 uppercase">Self-Healing</h3>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.selfHealingCount ?? 0} saves
            </p>
          </div>
        </div>

        {/* Konteineriai */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Critical Containers</h3>
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
            {/* ALERT HISTORY */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🚨</span> Recent Alerts
          </h3>
          
          {stats.alerts && stats.alerts.length > 0 ? (
            <div className="space-y-2">
              {stats.alerts.map((alert: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                  <span className="text-xs font-mono text-red-500 dark:text-red-400 whitespace-nowrap mt-0.5">
                    {alert.time}
                  </span>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No alerts recorded. Everything is running smoothly!</p>
          )}
        </div>
      </main>
    </div>
  );
}