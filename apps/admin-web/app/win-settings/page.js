'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function WinSettingsPage() {
  const router = useRouter();
  const [winSettings, setWinSettings] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    series_id: '',
    rank: '',
    prize_name: '',
    prize_description: '',
    asset_url: '',
    win_count: 1
  });

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
      const [winRes, seriesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/win-settings`),
        axios.get(`${API_URL}/admin/series`)
      ]);
      setWinSettings(winRes.data);
      setSeries(seriesRes.data);
      setLoading(false);
    } catch (err) {
      setError('データ取得に失敗しました');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/admin/win-settings/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/admin/win-settings`, formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        series_id: '',
        rank: '',
        prize_name: '',
        prize_description: '',
        asset_url: '',
        win_count: 1
      });
      fetchData();
    } catch (err) {
      setError('当選設定の保存に失敗しました');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      series_id: item.series_id,
      rank: item.rank,
      prize_name: item.prize_name,
      prize_description: item.prize_description,
      asset_url: item.asset_url || '',
      win_count: item.win_count
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await axios.delete(`${API_URL}/admin/win-settings/${id}`);
      fetchData();
    } catch (err) {
      setError('当選設定の削除に失敗しました');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>当選設定管理</h1>
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

      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({
            series_id: '',
            rank: '',
            prize_name: '',
            prize_description: '',
            asset_url: '',
            win_count: 1
          });
        }}
        style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {showForm ? 'フォームを閉じる' : '新規作成'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>{editingId ? '当選設定編集' : '新規当選設定作成'}</h2>
          <div style={{ marginBottom: '10px' }}>
            <label>シリーズ:
              <select
                value={formData.series_id}
                onChange={(e) => setFormData({ ...formData, series_id: parseInt(e.target.value) })}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
              >
                <option value="">選択してください</option>
                {series.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>順位:
              <input
                type="text"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
                placeholder="例: 1等, 2等, ハズレ"
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>賞品名:
              <input
                type="text"
                value={formData.prize_name}
                onChange={(e) => setFormData({ ...formData, prize_name: e.target.value })}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>賞品説明:
              <textarea
                value={formData.prize_description}
                onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                style={{ marginLeft: '10px', padding: '5px', width: '300px', height: '60px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>画像URL:
              <input
                type="text"
                value={formData.asset_url}
                onChange={(e) => setFormData({ ...formData, asset_url: e.target.value })}
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>当選数:
              <input
                type="number"
                value={formData.win_count}
                onChange={(e) => setFormData({ ...formData, win_count: parseInt(e.target.value) || 1 })}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
              />
            </label>
          </div>
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
            {editingId ? '更新' : '作成'}
          </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>シリーズID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>順位</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>賞品名</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>賞品説明</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>当選数</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {winSettings.map(item => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.series_id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.rank}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.prize_name}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.prize_description}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.win_count}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                <button onClick={() => handleEdit(item)} style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}>
                  編集
                </button>
                <button onClick={() => handleDelete(item.id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => router.push('/series')} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
          シリーズ管理へ
        </button>
        <button onClick={() => router.push('/slots')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          スロット管理へ
        </button>
      </div>
    </div>
  );
}