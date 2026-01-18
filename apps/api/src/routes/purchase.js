const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// 購入エンドポイント（順番配布）
router.post('/purchase', async (req, res) => {
  const { series_id, user_id } = req.body;

  console.log('購入リクエスト:', { series_id, user_id });

  try {
    // トランザクション開始
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1) 次に利用可能なスロットを取得（slot_number順、ロック）
      const slotResult = await client.query(
        `SELECT * FROM slots
         WHERE series_id = $1 AND status = 'available'
         ORDER BY slot_number ASC
         LIMIT 1
         FOR UPDATE`,
        [series_id]
      );

      if (slotResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: '利用可能なスロットがありません' });
      }

      const slot = slotResult.rows[0];

      // 2) スロットを購入済みに更新
      await client.query(
        `UPDATE slots
         SET status = 'purchased', purchased_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [slot.id]
      );

      // 3) 購入レコードを作成
      const purchaseResult = await client.query(
        `INSERT INTO purchases
         (series_id, slot_id, user_id, slot_number, card_name, card_image_url, card_value, card_rarity, card_description, purchased_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *`,
        [
          series_id,
          slot.id,
          user_id || null,
          slot.slot_number,
          slot.card_name,
          slot.card_image_url,
          slot.card_value,
          slot.card_rarity,
          slot.card_description
        ]
      );

      await client.query('COMMIT');

      const purchase = purchaseResult.rows[0];
      console.log('購入成功:', purchase);

      res.json({
        success: true,
        purchase_id: purchase.id,
        slot_number: purchase.slot_number,
        card: {
          name: purchase.card_name,
          image_url: purchase.card_image_url,
          value: purchase.card_value,
          rarity: purchase.card_rarity,
          description: purchase.card_description
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('購入エラー:', error);
    res.status(500).json({ error: '購入処理に失敗しました' });
  }
});

// 購入詳細取得
router.get('/purchases/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, s.name as series_name, s.animation_video_url
       FROM purchases p
       LEFT JOIN series s ON p.series_id = s.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '購入情報が見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('購入情報取得エラー:', error);
    res.status(500).json({ error: '購入情報の取得に失敗しました' });
  }
});

module.exports = router;