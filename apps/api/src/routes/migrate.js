const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/migrate', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS series (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, price_jpy INTEGER NOT NULL DEFAULT 0, total_slots INTEGER NOT NULL, start_date TIMESTAMPTZ NOT NULL, end_date TIMESTAMPTZ NOT NULL, status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`);
    await pool.query(`CREATE TABLE IF NOT EXISTS win_settings (id SERIAL PRIMARY KEY, series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE, rank VARCHAR(50) NOT NULL, prize_name VARCHAR(255) NOT NULL, prize_description TEXT, asset_url TEXT, win_count INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`);
    await pool.query(`CREATE TABLE IF NOT EXISTS slots (id SERIAL PRIMARY KEY, series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE, slot_number INTEGER NOT NULL, status VARCHAR(50) DEFAULT 'unallocated' CHECK (status IN ('unallocated', 'reserved', 'purchased')), win_rank VARCHAR(50), reserved_at TIMESTAMPTZ, purchased_at TIMESTAMPTZ, purchase_id VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(series_id, slot_number));`);
    await pool.query(`CREATE TABLE IF NOT EXISTS purchases (id SERIAL PRIMARY KEY, series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE, slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE, slot_number INTEGER NOT NULL, user_email VARCHAR(255), amount_jpy INTEGER NOT NULL, stripe_payment_intent_id VARCHAR(255), stripe_session_id VARCHAR(255), status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')), win_rank VARCHAR(50), purchased_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`);
    await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs (id SERIAL PRIMARY KEY, actor VARCHAR(255) NOT NULL, action VARCHAR(255) NOT NULL, target_type VARCHAR(100), target_id INTEGER, changes JSONB, reason TEXT, ip_address VARCHAR(45), user_agent TEXT, created_at TIMESTAMPTZ DEFAULT NOW());`);
    await pool.query(`CREATE TABLE IF NOT EXISTS assets (id SERIAL PRIMARY KEY, file_name VARCHAR(255) NOT NULL, file_url TEXT NOT NULL, file_type VARCHAR(100), file_size BIGINT, uploaded_by VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW());`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_slots_series_id ON slots(series_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_slots_status ON slots(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_purchases_series_id ON purchases(series_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);`);
    await pool.query(`CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;`);
    await pool.query(`DROP TRIGGER IF EXISTS update_series_updated_at ON series; CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`);
    await pool.query(`DROP TRIGGER IF EXISTS update_win_settings_updated_at ON win_settings; CREATE TRIGGER update_win_settings_updated_at BEFORE UPDATE ON win_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`);
    await pool.query(`DROP TRIGGER IF EXISTS update_slots_updated_at ON slots; CREATE TRIGGER update_slots_updated_at BEFORE UPDATE ON slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`);
    await pool.query(`DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases; CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`);
    res.json({ success: true, message: 'マイグレーション完了' });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    await pool.query(`INSERT INTO series (name, description, price_jpy, total_slots, start_date, end_date, status) VALUES ('2026年お年玉くじ', '新年特別企画！豪華賞品が当たるオンラインくじ', 0, 100, NOW(), NOW() + INTERVAL '30 days', 'active') ON CONFLICT DO NOTHING;`);
    await pool.query(`INSERT INTO win_settings (series_id, rank, prize_name, prize_description, win_count) VALUES (1, '1等', 'Nintendo Switch', '最新ゲーム機本体', 1), (1, '2等', 'AirPods Pro', 'Apple純正ワイヤレスイヤホン', 3), (1, '3等', 'Amazonギフト券5,000円', 'デジタルギフトコード', 10), (1, '4等', 'Starbucksギフトカード1,000円', 'コーヒーチケット', 20), (1, 'ハズレ', '応募ありがとうございました', '次回もぜひご参加ください', 66) ON CONFLICT DO NOTHING;`);
    await pool.query(`INSERT INTO slots (series_id, slot_number, status, win_rank) SELECT 1, n, 'unallocated', CASE WHEN n = 1 THEN '1等' WHEN n IN (2, 3, 4) THEN '2等' WHEN n BETWEEN 5 AND 14 THEN '3等' WHEN n BETWEEN 15 AND 34 THEN '4等' ELSE 'ハズレ' END FROM generate_series(1, 100) AS n ON CONFLICT DO NOTHING;`);
    res.json({ success: true, message: 'テストデータ投入完了' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;