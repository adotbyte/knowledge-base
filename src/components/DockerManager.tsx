'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl'; // <-- Vertimams
import { getDockerContainers, controlContainer } from '../app/actions';
import { useRouter } from 'next/navigation';

type Container = {
  id: string;
  name: string;
  state: string;
  status: string;
  image: string;
};

export default function DockerManager() {
  const t = useTranslations('Components'); // <-- Vertimų hook'as
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const fetchContainers = async () => {
    const data = await getDockerContainers();
    setContainers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(`${id}-${action}`);
    await controlContainer(id, action);
    await fetchContainers();
    setActionLoading(null);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="animate-pulse p-10 text-center text-gray-500">
        {t('dockerLoading')} {/* <-- VERTIMAS */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {containers.map((container) => (
        <div
          key={container.id}
          className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-3">
              <h3 className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                {container.name}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  container.state === 'running'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {container.state}
              </span>
            </div>
            <p className="font-mono text-xs text-gray-500">{container.image}</p>
            <p className="mt-1 text-xs text-gray-400">{container.status}</p>
          </div>

          <div className="flex items-center gap-2">
            {container.state !== 'running' && (
              <button
                onClick={() => handleAction(container.id, 'start')}
                disabled={!!actionLoading}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === `${container.id}-start` ? '...' : t('dockerStart')}{' '}
                {/* <-- VERTIMAS */}
              </button>
            )}

            {container.state === 'running' && (
              <>
                <button
                  onClick={() => handleAction(container.id, 'restart')}
                  disabled={!!actionLoading}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {actionLoading === `${container.id}-restart` ? '...' : t('dockerRestart')}{' '}
                  {/* <-- VERTIMAS */}
                </button>
                <button
                  onClick={() => handleAction(container.id, 'stop')}
                  disabled={!!actionLoading}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === `${container.id}-stop` ? '...' : t('dockerStop')}{' '}
                  {/* <-- VERTIMAS */}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
