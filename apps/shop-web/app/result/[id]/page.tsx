'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PurchaseData {
  id: number;
  card_name: string;
  card_image_url: string;
  card_value: number;
  card_rarity: string;
  card_description: string;
}

const rarityColors: Record<string, string> = {
  UR: 'from-red-500 to-pink-500',
  SSR: 'from-orange-500 to-yellow-500',
  SR: 'from-blue-500 to-cyan-500',
  R: 'from-green-500 to-emerald-500'
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PurchaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/purchases/${params.id}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl sm:text-2xl">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="text-xl sm:text-2xl mb-4">データが見つかりません</div>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-purple-600 rounded-lg">
            トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-black/50 backdrop-blur-md border-2 border-purple-500/30 rounded-2xl p-4 sm:p-8">
          <div className={`bg-gradient-to-r ${rarityColors[data.card_rarity] || rarityColors.R} text-white text-center py-2 px-4 rounded-lg text-sm sm:text-base font-bold mb-4 sm:mb-6`}>
            {data.card_rarity}
          </div>

          {data.card_image_url && (
            <img src={data.card_image_url} alt={data.card_name} className="w-full rounded-lg mb-4 sm:mb-6" />
          )}

          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2 sm:mb-4">{data.card_name}</h2>
          <div className="text-2xl sm:text-3xl font-bold text-purple-400 text-center mb-4 sm:mb-6">
            ¥{data.card_value.toLocaleString()}
          </div>
          <p className="text-gray-300 text-sm sm:text-base text-center mb-6 sm:mb-8">{data.card_description}</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm sm:text-base"
            >
              トップへ戻る
            </button>
            <button
              onClick={() => alert('シェア機能は後日実装予定です')}
              className="flex-1 px-4 sm:px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all text-sm sm:text-base"
            >
              シェアする
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}