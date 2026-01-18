'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('');
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
      const [slotsRes, seriesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/slots`),
        axios.get(`${API_URL}/admin/series`)
      ]);
      setSlots(slotsRes.data);
      setSeries(seriesRes.data);
      setLoading(false);
    } catch (err) {
      setError('データ取得に失敗しました');
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/admin/slots/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      setError('ステータス変更に失敗しました');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const filteredSlots = selectedSeries
    ? slots.filter(slot => slot.series_id === parseInt(selectedSeries))
    : slots;

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>スロット管理</h1>
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

      <div style={{ marginBottom: '20px' }}>
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

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>シリーズID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>スロット番号</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ステータス</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>当選順位</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>予約日時</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>購入日時</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredSlots.map(slot => (
            <tr key={slot.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{slot.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{slot.series_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{slot.slot_number}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                <select
                  value={slot.status}
                  onChange={(e) => handleStatusChange(slot.id, e.target.value)}
                  style={{ padding: '5px' }}
                >
                  <option value="unallocated">未割当</option>
                  <option value="reserved">予約済み</option>
                  <option value="purchased">購入済み</option>
                </select>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{slot.win_rank || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {slot.reserved_at ? new Date(slot.reserved_at).toLocaleString('ja-JP') : '-'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {slot.purchased_at ? new Date(slot.purchased_at).toLocaleString('ja-JP') : '-'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {slot.status === 'reserved' && (
                  <button
                    onClick={() => handleStatusChange(slot.id, 'unallocated')}
                    style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#ffc107', border: 'none', borderRadius: '3px' }}
                  >
                    予約解除
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <p>合計スロット数: {filteredSlots.length}</p>
        <p>未割当: {filteredSlots.filter(s => s.status === 'unallocated').length}</p>
        <p>予約済み: {filteredSlots.filter(s => s.status === 'reserved').length}</p>
        <p>購入済み: {filteredSlots.filter(s => s.status === 'purchased').length}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => router.push('/series')} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
          シリーズ管理へ
        </button>
        <button onClick={() => router.push('/win-settings')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          当選設定へ
        </button>
      </div>
    </div>
  );
}