'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CardsPage() {
  const router = useRouter();
  const [series, setSeries] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardImageUrl, setCardImageUrl] = useState('');
  const [cardValue, setCardValue] = useState('');
  const [cardRarity, setCardRarity] = useState('');
  const [cardDescription, setCardDescription] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }
    fetchSeries();
  }, []);

  useEffect(() => {
    if (selectedSeriesId) {
      fetchSlots(selectedSeriesId);
    }
  }, [selectedSeriesId]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/series`);
      const data = await response.json();
      setSeries(data);
      if (data.length > 0) {
        setSelectedSeriesId(data[0].id);
      }
    } catch (error) {
      console.error('シリーズ取得エラー:', error);
    }
  };

  const fetchSlots = async (seriesId) => {
    try {
      const response = await fetch(`${API_URL}/admin/series/${seriesId}/slots`);
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      console.error('スロット取得エラー:', error);
    }
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setCardName(slot.card_name || '');
    setCardImageUrl(slot.card_image_url || '');
    setCardValue(slot.card_value || '');
    setCardRarity(slot.card_rarity || '');
    setCardDescription(slot.card_description || '');
  };

  const handleSave = async () => {
    if (!selectedSlot) return;

    try {
      const response = await fetch(`${API_URL}/admin/slots/${selectedSlot.id}/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_name: cardName,
          card_image_url: cardImageUrl,
          card_value: parseFloat(cardValue),
          card_rarity: cardRarity,
          card_description: cardDescription,
        }),
      });

      if (response.ok) {
        alert('カード登録成功！');
        fetchSlots(selectedSeriesId);
        setSelectedSlot(null);
        setCardName('');
        setCardImageUrl('');
        setCardValue('');
        setCardRarity('');
        setCardDescription('');
      } else {
        const error = await response.json();
        alert(`エラー: ${error.error || '登録に失敗しました'}`);
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const getSlotColor = (slot) => {
    if (!slot.card_name) return '#e0e0e0'; // 未登録
    switch (slot.card_rarity) {
      case 'UR': return '#ff4444'; // 赤
      case 'SSR': return '#ffaa00'; // オレンジ
      case 'SR': return '#4444ff'; // 青
      case 'R': return '#44ff44'; // 緑
      default: return '#cccccc'; // その他
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        🃏 カード登録
      </h1>

      {/* ナビゲーション */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => router.push('/dashboard')} style={buttonStyle}>
          ダッシュボード
        </button>
        <button onClick={() => router.push('/series')} style={buttonStyle}>
          シリーズ管理
        </button>
        <button onClick={() => router.push('/cards')} style={{ ...buttonStyle, backgroundColor: '#0070f3' }}>
          カード登録
        </button>
        <button onClick={() => localStorage.removeItem('isAuthenticated') || router.push('/login')} style={buttonStyle}>
          ログアウト
        </button>
      </div>

      {/* シリーズ選択 */}
      <div style={{ marginBottom: '20px' }}>
        <label>シリーズ選択: </label>
        <select value={selectedSeriesId} onChange={(e) => setSelectedSeriesId(e.target.value)} style={selectStyle}>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (総スロット数: {s.total_slots})
            </option>
          ))}
        </select>
      </div>

      {/* 凡例 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={legendItemStyle}>
          <div style={{ ...legendColorStyle, backgroundColor: '#e0e0e0' }}></div>
          未登録
        </div>
        <div style={legendItemStyle}>
          <div style={{ ...legendColorStyle, backgroundColor: '#ff4444' }}></div>
          UR
        </div>
        <div style={legendItemStyle}>
          <div style={{ ...legendColorStyle, backgroundColor: '#ffaa00' }}></div>
          SSR
        </div>
        <div style={legendItemStyle}>
          <div style={{ ...legendColorStyle, backgroundColor: '#4444ff' }}></div>
          SR
        </div>
        <div style={legendItemStyle}>
          <div style={{ ...legendColorStyle, backgroundColor: '#44ff44' }}></div>
          R
        </div>
      </div>

      {/* スロット一覧 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px', marginBottom: '30px' }}>
        {slots.map((slot) => (
          <div
            key={slot.id}
            onClick={() => handleSlotClick(slot)}
            style={{
              ...slotStyle,
              backgroundColor: getSlotColor(slot),
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{slot.slot_number}</div>
            {slot.card_name && (
              <div style={{ fontSize: '10px', marginTop: '5px' }}>{slot.card_rarity}</div>
            )}
          </div>
        ))}
      </div>

      {/* カード編集パネル */}
      {selectedSlot && (
        <div style={panelStyle}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>
            スロット {selectedSlot.slot_number} - カード登録
          </h2>

          <div style={{ marginBottom: '15px' }}>
            <label>カード名:</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              style={inputStyle}
              placeholder="例: ピカチュウVMAX PSA10"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>カード画像URL:</label>
            <input
              type="text"
              value={cardImageUrl}
              onChange={(e) => setCardImageUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>カード価値（円）:</label>
            <input
              type="number"
              value={cardValue}
              onChange={(e) => setCardValue(e.target.value)}
              style={inputStyle}
              placeholder="例: 100000"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>レアリティ:</label>
            <select value={cardRarity} onChange={(e) => setCardRarity(e.target.value)} style={selectStyle}>
              <option value="">選択してください</option>
              <option value="UR">UR</option>
              <option value="SSR">SSR</option>
              <option value="SR">SR</option>
              <option value="R">R</option>
              <option value="N">N</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>説明:</label>
            <textarea
              value={cardDescription}
              onChange={(e) => setCardDescription(e.target.value)}
              style={{ ...inputStyle, height: '80px' }}
              placeholder="カードの説明を入力..."
            />
          </div>

          <div>
            <button onClick={handleSave} style={{ ...buttonStyle, backgroundColor: '#0070f3' }}>
              保存
            </button>
            <button onClick={() => setSelectedSlot(null)} style={buttonStyle}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// スタイル定義
const buttonStyle = {
  padding: '10px 20px',
  marginRight: '10px',
  backgroundColor: '#333',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const selectStyle = {
  padding: '8px',
  fontSize: '16px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const slotStyle = {
  padding: '15px',
  borderRadius: '8px',
  textAlign: 'center',
  color: '#333',
  fontWeight: 'bold',
};

const panelStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  fontSize: '16px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  marginTop: '5px',
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const legendColorStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '4px',
};
