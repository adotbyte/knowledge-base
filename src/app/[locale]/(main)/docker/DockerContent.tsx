'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { getDockerContainers, controlContainer } from '@/app/actions';

// ✅ Apibrėžiame props tipą
interface DockerContentProps {
  translations: {
    title: string;
    subtitle: string;
    backToNotes: string;
    loading: string;
    noContainers: string;
    containerName: string;
    containerState: string;
    containerImage: string;
    actions: string;
    running: string;
    stopped: string;
    start: string;
    stop: string;
    restart: string;
  };
}

export default function DockerContent({ translations }: DockerContentProps) {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContainers = async () => {
    setLoading(true);
    const data = await getDockerContainers();
    setContainers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    await controlContainer(id, action);
    fetchContainers();
  };

  if (loading) return <div className="p-10 text-center">{translations.loading}</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans md:p-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              {translations.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{translations.subtitle}</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; {translations.backToNotes}
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {containers.length === 0 ? (
            <p className="text-gray-500">{translations.noContainers}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="pb-3 font-medium">{translations.containerName}</th>
                    <th className="pb-3 font-medium">{translations.containerState}</th>
                    <th className="pb-3 font-medium">{translations.containerImage}</th>
                    <th className="pb-3 text-right font-medium">{translations.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {containers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">
                        {c.name}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            c.state === 'running'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {c.state === 'running' ? translations.running : translations.stopped}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{c.image}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.state !== 'running' && (
                            <button
                              onClick={() => handleAction(c.id, 'start')}
                              className="text-xs font-bold text-green-600 hover:underline"
                            >
                              {translations.start}
                            </button>
                          )}
                          {c.state === 'running' && (
                            <button
                              onClick={() => handleAction(c.id, 'stop')}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              {translations.stop}
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(c.id, 'restart')}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            {translations.restart}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
