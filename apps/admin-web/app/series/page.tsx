'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SeriesPage() {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/admin/series`).then(r => r.json()).then(setSeries);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">シリーズ管理</h1>
      <div className="grid gap-4">
        {series.map((s: any) => (
          <div key={s.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold">{s.name}</h2>
            <p className="text-gray-600">{s.description}</p>
            <div className="mt-4 flex gap-4">
              <span className="text-sm">価格: ¥{s.price_jpy}</span>
              <span className="text-sm">スロット数: {s.total_slots}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}