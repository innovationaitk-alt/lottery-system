
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

module.exports = router;
