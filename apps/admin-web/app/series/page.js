'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SeriesPage() {
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_jpy: 0,
    total_slots: 100,
    start_date: '',
    end_date: '',
    status: 'draft'
  });

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/series`);
      setSeries(response.data);
      setLoading(false);
    } catch (err) {
      setError('シリーズ取得に失敗しました');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/admin/series/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/admin/series`, formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price_jpy: 0,
        total_slots: 100,
        start_date: '',
        end_date: '',
        status: 'draft'
      });
      fetchSeries();
    } catch (err) {
      setError('シリーズの保存に失敗しました');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description,
      price_jpy: item.price_jpy,
      total_slots: item.total_slots,
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      status: item.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await axios.delete(`${API_URL}/admin/series/${id}`);
      fetchSeries();
    } catch (err) {
      setError('シリーズの削除に失敗しました');
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
        <h1>シリーズ管理</h1>
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
            name: '',
            description: '',
            price_jpy: 0,
            total_slots: 100,
            start_date: '',
            end_date: '',
            status: 'draft'
          });
        }}
        style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {showForm ? 'フォームを閉じる' : '新規作成'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>{editingId ? 'シリーズ編集' : '新規シリーズ作成'}</h2>
          <div style={{ marginBottom: '10px' }}>
            <label>名称:
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>説明:
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ marginLeft: '10px', padding: '5px', width: '300px', height: '60px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>価格（円）:
              <input
                type="number"
                value={formData.price_jpy}
                onChange={(e) => setFormData({ ...formData, price_jpy: parseInt(e.target.value) || 0 })}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>総スロット数:
              <input
                type="number"
                value={formData.total_slots}
                onChange={(e) => setFormData({ ...formData, total_slots: parseInt(e.target.value) || 100 })}
                required
                style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>開始日:
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>終了日:
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>ステータス:
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ marginLeft: '10px', padding: '5px' }}
              >
                <option value="draft">下書き</option>
                <option value="active">アクティブ</option>
                <option value="closed">終了</option>
              </select>
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
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>名称</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>説明</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>価格（円）</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>総スロット数</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>開始日</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>終了日</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ステータス</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {series.map(item => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.description}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.price_jpy}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.total_slots}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.start_date ? new Date(item.start_date).toLocaleDateString('ja-JP') : ''}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.end_date ? new Date(item.end_date).toLocaleDateString('ja-JP') : ''}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{item.status}</td>
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
        <button onClick={() => router.push('/win-settings')} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
          当選設定へ
        </button>
        <button onClick={() => router.push('/slots')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          スロット管理へ
        </button>
      </div>
    </div>
  );
}