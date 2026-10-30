'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import Navbar from '../components/Navbar';

export default function StatusPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const days = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];

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

        {/* RESPONSE TIME CHART */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Response Time (seconds)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.responseTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="s" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Portfolio" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Knowledge" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

                    {/* PING LATENCY CHART */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Ping Latency (ms)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.pingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Cloudflare" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Skynet_Warsaw" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Hetzner_Frankfurt" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Google" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
                {/* PING STATISTIKA */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Ping Statistics</h3>
          {stats?.serverStats ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                    <th className="pb-3 font-medium">Serveris</th>
                    <th className="pb-3 font-medium text-right">Vidurkis (ms)</th>
                    <th className="pb-3 font-medium text-right">Min (ms)</th>
                    <th className="pb-3 font-medium text-right">Max (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Cloudflare */}
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Cloudflare
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Cloudflare']?.avg || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Cloudflare']?.min || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Cloudflare']?.max || '-'}</td>
                  </tr>
                  
                  {/* Google */}
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Google
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Google']?.avg || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Google']?.min || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Google']?.max || '-'}</td>
                  </tr>

                  {/* Skynet_Warsaw */}
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Skynet_Warsaw
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Skynet_Warsaw']?.avg || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Skynet_Warsaw']?.min || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Skynet_Warsaw']?.max || '-'}</td>
                  </tr>

                  {/* Hetzner_Frankfurt */}
                  <tr>
                    <td className="py-3 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                      <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Hetzner_Frankfurt
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Hetzner_Frankfurt']?.avg || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Hetzner_Frankfurt']?.min || '-'}</td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-400">{stats.serverStats['Hetzner_Frankfurt']?.max || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Statistics are not available yet.</p>
          )}
        </div>

                {/* MONTHLY UPTIME CHART */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Monthly Uptime (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyUptime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Legend />
                <Bar dataKey="Portfolio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Knowledge" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>



                {/* ALERT HEATMAP */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8 overflow-x-auto">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Alert Frequency (by Day & Hour)</h3>
          <div className="h-[300px] w-full min-w-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="category" 
                  dataKey="hour" 
                  name="Hour" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  type="category" 
                  dataKey="day" 
                  name="Day" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDuplicatedCategory={false}
                />
                <ZAxis type="number" dataKey="count" range={[20, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                  formatter={(value: any, name: any, props: any) => [`${props.payload.count} alerts`, 'Frequency']}
                />
                <Scatter 
                  data={stats.heatmapData.flatMap((row: any) => 
                    days.map(day => ({ 
                      hour: row.hour, 
                      day, 
                      count: row[day] || 0 
                    }))
                  ).filter((d: any) => d.count > 0)} 
                  fill="#ef4444" 
                  shape="circle" 
                />
              </ScatterChart>
            </ResponsiveContainer>
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