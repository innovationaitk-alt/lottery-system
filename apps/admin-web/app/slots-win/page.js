'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SlotsWinPage() {
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [winType, setWinType] = useState('');
  const [winDetails, setWinDetails] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) router.push('/login');
  }, [router]);

  useEffect(() => {
    fetch(`${API_URL}/admin/series`)
      .then(r => r.json())
      .then(data => {
        setSeries(data);
        if (data.length > 0) setSelectedSeriesId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (selectedSeriesId) {
      setLoading(true);
      fetch(`${API_URL}/admin/series/${selectedSeriesId}/slots`)
        .then(r => r.json())
        .then(data => { setSlots(data); setLoading(false); });
    }
  }, [selectedSeriesId]);

  const handleSetWin = async () => {
    if (!selectedSlot || !winType) return;
    const res = await fetch(`${API_URL}/admin/slots/${selectedSlot.id}/win`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ win_type: winType, win_details: winDetails })
    });
    if (res.ok) {
      alert('保存しました');
      fetch(`${API_URL}/admin/series/${selectedSeriesId}/slots`)
        .then(r => r.json())
        .then(data => setSlots(data));
      setSelectedSlot(null);
      setWinType('');
      setWinDetails('');
    }
  };

  const getColor = (slot) => {
    if (!slot.win_type) return '#e0e0e0';
    if (slot.win_type === '1等') return '#ff4444';
    if (slot.win_type === '2等') return '#ffaa00';
    if (slot.win_type === '3等') return '#4444ff';
    return '#44ff44';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>🎯 スロット当たり設定</h1>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>戻る</button>
        </div>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
          <select value={selectedSeriesId} onChange={(e) => setSelectedSeriesId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
            {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {slots.map(slot => (
            <div key={slot.id} onClick={() => { setSelectedSlot(slot); setWinType(slot.win_type || ''); setWinDetails(slot.win_details || ''); }} style={{ background: getColor(slot), padding: '20px 10px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '18px', color: slot.win_type ? 'white' : '#666' }}>
              {slot.slot_number}
              {slot.win_type && <div style={{ fontSize: '12px', marginTop: '5px' }}>{slot.win_type}</div>}
            </div>
          ))}
        </div>
        {selectedSlot && (
          <div style={{ background: 'white', borderRadius: '15px', padding: '20px' }}>
            <h3>スロット {selectedSlot.slot_number} の設定</h3>
            <select value={winType} onChange={(e) => setWinType(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
              <option value="">未設定</option>
              <option value="1等">1等</option>
              <option value="2等">2等</option>
              <option value="3等">3等</option>
            </select>
            <input type="text" value={winDetails} onChange={(e) => setWinDetails(e.target.value)} placeholder="賞品詳細" style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '2px solid #e0e0e0' }} />
            <button onClick={handleSetWin} style={{ padding: '12px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' }}>保存</button>
            <button onClick={() => setSelectedSlot(null)} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>キャンセル</button>
          </div>
        )}
      </div>
    </div>
  );
}
