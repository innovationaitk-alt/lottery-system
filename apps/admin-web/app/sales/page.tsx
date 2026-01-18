'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SalesPage() {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/admin/purchases`).then(r => r.json()).then(setPurchases);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">売上管理</h1>
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">購入ID</th>
            <th className="p-4 text-left">カード名</th>
            <th className="p-4 text-left">レアリティ</th>
            <th className="p-4 text-left">価値</th>
            <th className="p-4 text-left">購入日時</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p: any) => (
            <tr key={p.id} className="border-t">
              <td className="p-4">{p.id}</td>
              <td className="p-4">{p.card_name}</td>
              <td className="p-4">{p.card_rarity}</td>
              <td className="p-4">¥{p.card_value?.toLocaleString()}</td>
              <td className="p-4">{new Date(p.purchased_at).toLocaleString('ja-JP')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}