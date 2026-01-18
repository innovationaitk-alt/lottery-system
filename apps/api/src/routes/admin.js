const express = require('express');
const pool = require('../db/pool');
const router = express.Router();


// シリーズ一覧
router.get('/series', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM series ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'シリーズ取得に失敗しました' });
  }
});

// シリーズ詳細取得
router.get('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM series WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'シリーズが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ error: 'シリーズ取得に失敗しました' });
  }
});
// シリーズ作成
router.post('/series', async (req, res) => {
  try {
    const { name, description, price_jpy, total_slots, start_date, end_date, status } = req.body;
    const result = await pool.query(
      'INSERT INTO series (name, description, price_jpy, total_slots, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, price_jpy, total_slots, start_date, end_date, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating series:', error);
    res.status(500).json({ error: 'シリーズ作成に失敗しました' });
  }
});

// シリーズ更新
router.put('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price_jpy, total_slots, start_date, end_date, status } = req.body;
    const result = await pool.query(
      'UPDATE series SET name=$1, description=$2, price_jpy=$3, total_slots=$4, start_date=$5, end_date=$6, status=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, description, price_jpy, total_slots, start_date, end_date, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'シリーズが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(500).json({ error: 'シリーズ更新に失敗しました' });
  }
});

// シリーズ削除
router.delete('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM series WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'シリーズが見つかりません' });
    }
    res.json({ message: '削除しました', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting series:', error);
    res.status(500).json({ error: 'シリーズ削除に失敗しました' });
  }
});

// 当選設定一覧
router.get('/win-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM win_settings ORDER BY series_id, id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching win settings:', error);
    res.status(500).json({ error: '当選設定取得に失敗しました' });
  }
});

// 当選設定作成
router.post('/win-settings', async (req, res) => {
  try {
    const { series_id, rank, prize_name, prize_description, asset_url, win_count } = req.body;
    const result = await pool.query(
      'INSERT INTO win_settings (series_id, rank, prize_name, prize_description, asset_url, win_count) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [series_id, rank, prize_name, prize_description, asset_url, win_count]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating win setting:', error);
    res.status(500).json({ error: '当選設定作成に失敗しました' });
  }
});

// 当選設定更新
router.put('/win-settings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { series_id, rank, prize_name, prize_description, asset_url, win_count } = req.body;
    const result = await pool.query(
      'UPDATE win_settings SET series_id=$1, rank=$2, prize_name=$3, prize_description=$4, asset_url=$5, win_count=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [series_id, rank, prize_name, prize_description, asset_url, win_count, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '当選設定が見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating win setting:', error);
    res.status(500).json({ error: '当選設定更新に失敗しました' });
  }
});

// 当選設定削除
router.delete('/win-settings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM win_settings WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '当選設定が見つかりません' });
    }
    res.json({ message: '削除しました', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting win setting:', error);
    res.status(500).json({ error: '当選設定削除に失敗しました' });
  }
});

// スロット一覧
router.get('/slots', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM slots ORDER BY series_id, slot_number');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'スロット取得に失敗しました' });
  }
});

// スロットステータス更新
router.patch('/slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE slots SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'スロットが見つかりません' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'スロット更新に失敗しました' });
  }
});

// 購入履歴一覧
router.get('/purchases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purchases ORDER BY purchased_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: '購入履歴取得に失敗しました' });
  }
});

// 監査ログ一覧
router.get('/audit-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: '監査ログ取得に失敗しました' });
  }
});

module.exports = router;
// ========================================
// スロット当たり設定 API
// ========================================

// 1. シリーズのスロット一覧取得（当たり情報含む）
router.get('/series/:seriesId/slots', async (req, res) => {
  try {
    const { seriesId } = req.params;

    const result = await pool.query(
      'SELECT * FROM slots WHERE series_id = $1 ORDER BY slot_number ASC',
      [seriesId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('スロット取得エラー:', error);
    res.status(500).json({ error: 'スロット取得に失敗しました' });
  }
});

// 2. 特定スロットに当たりを設定
router.post('/slots/:slotId/win', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { win_type, win_details } = req.body;

    const result = await pool.query(
      'UPDATE slots SET win_type = $1, win_details = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [win_type, win_details, slotId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'スロットが見つかりません' });
    }

    res.json({ success: true, slot: result.rows[0] });
  } catch (error) {
    console.error('当たり設定エラー:', error);
    res.status(500).json({ error: '当たり設定に失敗しました' });
  }
});

// 3. 当たり設定の削除
router.delete('/slots/:slotId/win', async (req, res) => {
  try {
    const { slotId } = req.params;

    const result = await pool.query(
      'UPDATE slots SET win_type = NULL, win_details = NULL, updated_at = NOW() WHERE id = $1 RETURNING *',
      [slotId]
    );

    res.json({ success: true, slot: result.rows[0] });
  } catch (error) {
    console.error('当たり削除エラー:', error);
    res.status(500).json({ error: '当たり削除に失敗しました' });
  }
});

// 4. シリーズの当たりスロット一覧取得
router.get('/series/:seriesId/winning-slots', async (req, res) => {
  try {
    const { seriesId } = req.params;

    const result = await pool.query(
      'SELECT * FROM slots WHERE series_id = $1 AND win_type IS NOT NULL ORDER BY slot_number ASC',
      [seriesId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('当たりスロット取得エラー:', error);
    res.status(500).json({ error: '当たりスロット取得に失敗しました' });
  }
});

// ========================================
// カード情報管理 API (オリパ仕様)
// ========================================

// 1. カード情報を設定
router.post('/slots/:slotId/card', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { card_name, card_image_url, card_value, card_rarity, card_description } = req.body;

    const result = await pool.query(
      'UPDATE slots SET card_name = $1, card_image_url = $2, card_value = $3, card_rarity = $4, card_description = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [card_name, card_image_url, card_value, card_rarity, card_description, slotId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'スロットが見つかりません' });
    }

    res.json({ success: true, slot: result.rows[0] });
  } catch (error) {
    console.error('カード設定エラー:', error);
    res.status(500).json({ error: 'カード設定に失敗しました' });
  }
});

// 2. カード情報を削除
router.delete('/slots/:slotId/card', async (req, res) => {
  try {
    const { slotId } = req.params;

    const result = await pool.query(
      'UPDATE slots SET card_name = NULL, card_image_url = NULL, card_value = NULL, card_rarity = NULL, card_description = NULL, updated_at = NOW() WHERE id = $1 RETURNING *',
      [slotId]
    );

    res.json({ success: true, slot: result.rows[0] });
  } catch (error) {
    console.error('カード削除エラー:', error);
    res.status(500).json({ error: 'カード削除に失敗しました' });
  }
});

// 3. シリーズの登録済みカード一覧取得
router.get('/series/:seriesId/registered-cards', async (req, res) => {
  try {
    const { seriesId } = req.params;

    const result = await pool.query(
      'SELECT * FROM slots WHERE series_id = $1 AND card_name IS NOT NULL ORDER BY card_value DESC',
      [seriesId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('登録カード取得エラー:', error);
    res.status(500).json({ error: '登録カード取得に失敗しました' });
  }
});

// 4. シリーズに抽選動画URLを設定
router.post('/series/:seriesId/animation', async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { animation_video_url } = req.body;

    const result = await pool.query(
      'UPDATE series SET animation_video_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [animation_video_url, seriesId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'シリーズが見つかりません' });
    }

    res.json({ success: true, series: result.rows[0] });
  } catch (error) {
    console.error('動画URL設定エラー:', error);
    res.status(500).json({ error: '動画URL設定に失敗しました' });
  }
});
