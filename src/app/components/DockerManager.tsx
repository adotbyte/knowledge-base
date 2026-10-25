'use client';

import { useState, useEffect } from 'react';
import { getDockerContainers, controlContainer } from '../actions';
import { useRouter } from 'next/navigation';

type Container = {
  id: string;
  name: string;
  state: string;
  status: string;
  image: string;
};

export default function DockerManager() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  // Funkcija duomenų užkrovimui
  const fetchContainers = async () => {
    const data = await getDockerContainers();
    setContainers(data);
    setLoading(false);
  };

  // Užkrauname duomenis ir nustatome automatinį atnaujinimą kas 5 sekundes
  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(`${id}-${action}`);
    await controlContainer(id, action);
    await fetchContainers(); // Atsinaujiname sąrašą iškart po veiksmo
    setActionLoading(null);
    router.refresh();
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-500 animate-pulse">Loading Docker containers...</div>;
  }

  return (
    <div className="space-y-4">
      {containers.map((container) => (
        <div key={container.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Konteinerio informacija */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-mono text-lg font-bold text-gray-900 dark:text-white">{container.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                container.state === 'running' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {container.state}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">{container.image}</p>
            <p className="text-xs text-gray-400 mt-1">{container.status}</p>
          </div>

          {/* Valdymo mygtukai */}
          <div className="flex items-center gap-2">
            {container.state !== 'running' && (
              <button
                onClick={() => handleAction(container.id, 'start')}
                disabled={!!actionLoading}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === `${container.id}-start` ? '...' : 'Start'}
              </button>
            )}
            
            {container.state === 'running' && (
              <>
                <button
                  onClick={() => handleAction(container.id, 'restart')}
                  disabled={!!actionLoading}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === `${container.id}-restart` ? '...' : 'Restart'}
                </button>
                <button
                  onClick={() => handleAction(container.id, 'stop')}
                  disabled={!!actionLoading}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === `${container.id}-stop` ? '...' : 'Stop'}
                </button>
              </>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}