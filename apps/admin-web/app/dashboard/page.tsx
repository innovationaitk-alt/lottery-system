'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalSales: 0, totalPurchases: 0, totalUsers: 0 });

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/admin/purchases`).then(r => r.json()),
    ]).then(([purchases]) => {
      const total = purchases.reduce((sum: number, p: any) => sum + (p.card_value || 0), 0);
      setStats({ totalSales: total, totalPurchases: purchases.length, totalUsers: 0 });
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">総売上</div>
          <div className="text-3xl font-bold">¥{stats.totalSales.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">購入件数</div>
          <div className="text-3xl font-bold">{stats.totalPurchases}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">ユーザー数</div>
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
        </div>
      </div>
    </div>
  );
}