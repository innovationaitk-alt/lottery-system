'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [purchasesRes, seriesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/purchases`),
        axios.get(`${API_URL}/admin/series`)
      ]);
      setPurchases(purchasesRes.data);
      setSeries(seriesRes.data);
      setLoading(false);
    } catch (err) {
      setError('データ取得に失敗しました');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const filteredPurchases = purchases.filter(purchase => {
    const seriesMatch = selectedSeries ? purchase.series_id === parseInt(selectedSeries) : true;
    const emailMatch = searchEmail ? (purchase.user_email || '').toLowerCase().includes(searchEmail.toLowerCase()) : true;
    return seriesMatch && emailMatch;
  });

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>購入履歴</h1>
        <div>
          <button onClick={() => router.push('/dashboard')} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            ダッシュボードへ戻る
          </button>
          <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            ログアウト
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <div>
          <label>シリーズ選択:
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
            >
              <option value="">全て</option>
              {series.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>メール検索:
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="メールアドレスで検索"
              style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
            />
          </label>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>シリーズID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>スロット番号</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>メールアドレス</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>金額（円）</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ステータス</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>当選順位</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>購入日時</th>
          </tr>
        </thead>
        <tbody>
          {filteredPurchases.map(purchase => (
            <tr key={purchase.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{purchase.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{purchase.series_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{purchase.slot_number}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{purchase.user_email || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{purchase.amount_jpy}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '3px',
                  backgroundColor: purchase.status === 'completed' ? '#28a745' : purchase.status === 'failed' ? '#dc3545' : '#ffc107',
                  color: 'white'
                }}>
                  {purchase.status}
                </span>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{purchase.win_rank || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {purchase.purchased_at ? new Date(purchase.purchased_at).toLocaleString('ja-JP') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <p>合計購入数: {filteredPurchases.length}</p>
        <p>完了: {filteredPurchases.filter(p => p.status === 'completed').length}</p>
        <p>保留中: {filteredPurchases.filter(p => p.status === 'pending').length}</p>
        <p>失敗: {filteredPurchases.filter(p => p.status === 'failed').length}</p>
        <p>合計金額: ¥{filteredPurchases.reduce((sum, p) => sum + p.amount_jpy, 0).toLocaleString()}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => router.push('/audit-logs')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          監査ログへ
        </button>
      </div>
    </div>
  );
}