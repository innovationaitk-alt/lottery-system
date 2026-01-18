const express = require('express');
const router = express.Router();

let purchaseCounter = 1;

// 購入エンドポイント（修正版）
router.post('/purchase', async (req, res) => {
  try {
    const { series_id } = req.body;
    
    console.log('購入リクエスト:', { series_id });
    
    const purchaseId = purchaseCounter++;
    
    const response = {
      success: true,
      purchase_id: purchaseId,
      slot_number: purchaseCounter,
      card: {
        name: 'テストカード',
        image_url: null,
        value: 1000,
        rarity: 'SR',
        description: 'テスト用のカードです'
      }
    };
    
    console.log('購入成功:', response);
    
    res.json(response);
  } catch (error) {
    console.error('購入エラー:', error);
    res.status(500).json({ error: '購入処理に失敗しました' });
  }
});

// 購入詳細取得
router.get('/purchases/:id', async (req, res) => {
  try {
    const response = {
      id: parseInt(req.params.id),
      series_name: '2026年お年玉くじ',
      slot_number: 1,
      card_name: 'テストカード',
      card_image_url: null,
      card_value: 1000,
      card_rarity: 'SR',
      card_description: 'テスト用のカードです',
      animation_video_url: null,
      purchased_at: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('購入情報取得エラー:', error);
    res.status(500).json({ error: '購入情報の取得に失敗しました' });
  }
});

module.exports = router;