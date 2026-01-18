'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Series {
  id: number;
  name: string;
  description: string;
  price_jpy: number;
  total_slots: number;
}

export default function Home() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/admin/series`)
      .then(res => res.json())
      .then(setSeries)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="bg-black/50 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            オリパワン
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            最高のオリパ体験を
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            厳選されたカードで夢を掴もう
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {series.map((s) => (
            <div
              key={s.id}
              onClick={() => router.push(`/series/${s.id}`)}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 cursor-pointer hover:scale-105 transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{s.name}</h3>
              <p className="text-gray-300 text-xs sm:text-sm mb-4">{s.description}</p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-purple-400">
                  ¥{s.price_jpy.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
                  残り: {s.total_slots}枠
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}