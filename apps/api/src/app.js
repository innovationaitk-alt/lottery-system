require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// マイグレーションエンドポイント
app.post('/migrate', async (req, res) => {
  console.log('========================================');
  console.log('🔄 /migrate エンドポイントが呼ばれました');
  console.log('========================================');

  try {
    const { runMigrations } = require('./db/migrate');
    console.log('✅ migrate.js をロードしました');

    await runMigrations();
    console.log('✅ マイグレーション実行完了');

    res.json({ success: true, message: 'マイグレーション完了' });
  } catch (error) {
    console.error('❌ マイグレーション実行エラー:', error.message);
    console.error('   スタックトレース:', error.stack);
    res.status(500).json({ error: 'マイグレーションに失敗しました', details: error.message });
  }
});

// Seed endpoint
app.post('/seed', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO series (name, description, price_jpy, total_slots, start_date, end_date, status)
      VALUES ('2026年お年玉くじ', '新年特別企画！豪華賞品が当たるオンラインくじ', 0, 100, NOW(), NOW() + INTERVAL '30 days', 'active')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO win_settings (series_id, rank, prize_name, prize_description, win_count)
      VALUES
      (1, '1等', 'Nintendo Switch', '最新ゲーム機本体', 1),
      (1, '2等', 'AirPods Pro', 'Apple純正ワイヤレスイヤホン', 3),
      (1, '3等', 'Amazonギフト券5,000円', 'デジタルギフトコード', 10),
      (1, '4等', 'Starbucksギフトカード1,000円', 'コーヒーチケット', 20),
      (1, 'ハズレ', '応募ありがとうございました', '次回もぜひご参加ください', 66)
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO slots (series_id, slot_number, status, win_rank)
      SELECT
        1,
        n,
        'unallocated',
        CASE
          WHEN n = 1 THEN '1等'
          WHEN n IN (2, 3, 4) THEN '2等'
          WHEN n BETWEEN 5 AND 14 THEN '3等'
          WHEN n BETWEEN 15 AND 34 THEN '4等'
          ELSE 'ハズレ'
        END
      FROM generate_series(1, 100) AS n
      ON CONFLICT DO NOTHING;
    `);

    res.json({ success: true, message: 'テストデータ投入完了' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
const adminRouter = require('./routes/admin');
const purchaseRoutes = require('./routes/purchase');
const uploadRoutes = require('./routes/upload');

app.use('/admin', adminRouter);
app.use('/api', purchaseRoutes);
app.use('/api', uploadRoutes);
app.use('/uploads', express.static('uploads'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;