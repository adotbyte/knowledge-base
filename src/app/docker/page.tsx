import DockerManager from '../components/DockerManager';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function DockerPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Docker Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your containers in real-time.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            &larr; Back to Notes
          </Link>
        </div>

        <DockerManager />
      </main>
    </div>
  );
}