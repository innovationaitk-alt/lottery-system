const express = require('express');
const router = express.Router();

// モックデータ
const mockSeries = {
  id: 1,
  name: '2026年お年玉くじ',
  description: '新年特別企画！豪華賞品が当たるオンラインくじ',
  price: 500,
  total_slots: 100,
  available_slots: 100,
  thumbnail_url: null,
  created_at: new Date().toISOString()
};

// シリーズ詳細取得
router.get('/series/:id', async (req, res) => {
  res.json(mockSeries);
});

// シリーズ一覧
router.get('/series', async (req, res) => {
  res.json([mockSeries]);
});

module.exports = router;