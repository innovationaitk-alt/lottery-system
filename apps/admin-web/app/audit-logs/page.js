'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchActor, setSearchActor] = useState('');
  const [searchAction, setSearchAction] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/audit-logs`);
      setLogs(response.data);
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

  const filteredLogs = logs.filter(log => {
    const actorMatch = searchActor ? log.actor.toLowerCase().includes(searchActor.toLowerCase()) : true;
    const actionMatch = searchAction ? log.action.toLowerCase().includes(searchAction.toLowerCase()) : true;
    return actorMatch && actionMatch;
  });

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>監査ログ</h1>
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
          <label>実行者検索:
            <input
              type="text"
              value={searchActor}
              onChange={(e) => setSearchActor(e.target.value)}
              placeholder="実行者で検索"
              style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
            />
          </label>
        </div>
        <div>
          <label>アクション検索:
            <input
              type="text"
              value={searchAction}
              onChange={(e) => setSearchAction(e.target.value)}
              placeholder="アクションで検索"
              style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
            />
          </label>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>実行者</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>アクション</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>対象タイプ</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>対象ID</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>変更内容</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>理由</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>IPアドレス</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>作成日時</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(log => (
            <tr key={log.id}>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{log.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{log.actor}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{log.action}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{log.target_type || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{log.target_id || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px', maxWidth: '200px', overflow: 'auto' }}>
                {log.changes ? (
                  <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                ) : '-'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{log.reason || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{log.ip_address || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {log.created_at ? new Date(log.created_at).toLocaleString('ja-JP') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <p>合計ログ数: {filteredLogs.length}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => router.push('/purchases')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          購入履歴へ
        </button>
      </div>
    </div>
  );
}