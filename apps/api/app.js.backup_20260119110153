const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// ✅ すべてのVercelデプロイURLを許可するCORS設定
app.use(cors({
  origin: function(origin, callback) {
    // ローカル開発環境
    const allowedLocalOrigins = [
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Vercelのドメイン（すべてのデプロイURLを許可）
    const isVercelDomain = origin && (
      origin.endsWith('.vercel.app') ||
      origin.endsWith('lottery-admin-web-kappa.vercel.app')
    );
    
    if (!origin || allowedLocalOrigins.includes(origin) || isVercelDomain) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Preflight requestsに対応
app.options('*', cors());

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========== Admin APIs ==========

// GET /admin/series - 全シリーズ取得
app.get('/admin/series', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM series ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

// POST /admin/series - 新規シリーズ作成
app.post('/admin/series', async (req, res) => {
  const { name, description, price_jpy, total_slots, start_date, end_date, status } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO series (name, description, price_jpy, total_slots, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price_jpy, total_slots, start_date, end_date, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating series:', error);
    res.status(500).json({ error: 'Failed to create series' });
  }
});

// GET /admin/series/:id - シリーズ詳細取得
app.get('/admin/series/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM series WHERE series_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

// GET /admin/series/:id/slots - シリーズのスロット一覧
app.get('/admin/series/:id/slots', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM slots WHERE series_id = $1 ORDER BY slot_number',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// POST /admin/slots/:id/card - カード登録
app.post('/admin/slots/:id/card', async (req, res) => {
  const { card_name, card_image_url, card_value, rarity } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE slots 
       SET card_name = $1, card_image_url = $2, card_value = $3, rarity = $4
       WHERE slot_id = $5
       RETURNING *`,
      [card_name, card_image_url, card_value, rarity, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error registering card:', error);
    res.status(500).json({ error: 'Failed to register card' });
  }
});

// GET /admin/purchases - 購入履歴一覧
app.get('/admin/purchases', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username, s.name as series_name, sl.slot_number, sl.card_name
       FROM purchases p
       LEFT JOIN users u ON p.user_id = u.user_id
       LEFT JOIN slots sl ON p.slot_id = sl.slot_id
       LEFT JOIN series s ON sl.series_id = s.series_id
       ORDER BY p.purchased_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// ========== Shop APIs ==========

// GET /shop/series - 販売中のシリーズ一覧
app.get('/shop/series', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM series 
       WHERE status = 'active' 
       AND start_date <= CURRENT_DATE 
       AND end_date >= CURRENT_DATE
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shop series:', error);
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

// GET /shop/series/:id - シリーズ詳細（購入ページ用）
app.get('/shop/series/:id', async (req, res) => {
  try {
    const seriesResult = await pool.query('SELECT * FROM series WHERE series_id = $1', [req.params.id]);
    if (seriesResult.rows.length === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }
    
    const slotsResult = await pool.query(
      'SELECT slot_id, slot_number, is_purchased FROM slots WHERE series_id = $1 ORDER BY slot_number',
      [req.params.id]
    );
    
    res.json({
      series: seriesResult.rows[0],
      slots: slotsResult.rows
    });
  } catch (error) {
    console.error('Error fetching series details:', error);
    res.status(500).json({ error: 'Failed to fetch series details' });
  }
});

// POST /shop/purchase - スロット購入
app.post('/shop/purchase', async (req, res) => {
  const { slot_id, user_id } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // スロット情報取得
    const slotResult = await client.query(
      'SELECT * FROM slots WHERE slot_id = $1 FOR UPDATE',
      [slot_id]
    );
    
    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    const slot = slotResult.rows[0];
    
    if (slot.is_purchased) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Slot already purchased' });
    }
    
    // スロットを購入済みに更新
    await client.query(
      'UPDATE slots SET is_purchased = true WHERE slot_id = $1',
      [slot_id]
    );
    
    // 購入履歴を記録
    const purchaseResult = await client.query(
      `INSERT INTO purchases (user_id, slot_id, card_name, card_image_url, card_value, rarity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, slot_id, slot.card_name, slot.card_image_url, slot.card_value, slot.rarity]
    );
    
    await client.query('COMMIT');
    
    res.json({
      purchase: purchaseResult.rows[0],
      card: {
        card_name: slot.card_name,
        card_image_url: slot.card_image_url,
        card_value: slot.card_value,
        rarity: slot.rarity
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});