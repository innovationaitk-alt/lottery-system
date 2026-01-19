-- マイグレーション: シリーズテーブルに抽選アニメーション動画URLカラムを追加
-- 作成日時: 2026-01-19

ALTER TABLE series 
ADD COLUMN IF NOT EXISTS animation_video_url TEXT;

-- 既存データの確認用コメント
-- 既存のシリーズには NULL が入ります
-- フロントエンドでは NULL の場合はデフォルト動画を使用します
