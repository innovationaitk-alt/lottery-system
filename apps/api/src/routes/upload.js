const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// アップロードディレクトリを作成
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 uploads ディレクトリを作成しました');
}

// Multer 設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    // 動画ファイルのみ許可
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('動画ファイルのみアップロード可能です'));
    }
  }
});

// 動画アップロード
router.post('/upload/video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません' });
    }

    // ファイルURLを返す（本番環境ではS3のURLになる）
    const fileUrl = `/uploads/${req.file.filename}`;
    
    console.log('✅ 動画アップロード成功:', fileUrl);
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ 動画アップロードエラー:', error);
    res.status(500).json({ error: '動画のアップロードに失敗しました' });
  }
});

module.exports = router;
