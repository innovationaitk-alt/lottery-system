# Digital Lottery System

デジタルくじシステム - Webベースの抽選プラットフォーム

## 概要

このシステムは、オンラインでデジタルくじの販売・抽選を行うためのプラットフォームです。Stripe決済統合、リアルタイム在庫管理、管理画面を備えています。

## アーキテクチャ

### システム構成

```
┌─────────────────┐     ┌─────────────────┐
│   Shop Web      │     │   Admin Web     │
│   (Next.js 16)  │     │   (Next.js 14)  │
│   Port: 3000    │     │   Port: 3001    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │     API     │
              │  (Express)  │
              │  Port: 8000 │
              └──────┬──────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼───┐  ┌───▼────┐  ┌──▼────┐
    │ Worker │  │  DB    │  │ MinIO │
    │(Node.js)│  │ (PG)  │  │ (S3)  │
    └────────┘  └────────┘  └───────┘
```

### 技術スタック

- **Frontend (Shop)**: Next.js 16, React 19, TailwindCSS 4
- **Frontend (Admin)**: Next.js 14, React 18, TailwindCSS 3
- **Backend API**: Node.js, Express, PostgreSQL
- **Worker**: Node.js (バックグラウンド処理)
- **Database**: PostgreSQL 15
- **Storage**: MinIO (S3互換オブジェクトストレージ)
- **Payment**: Stripe
- **Container**: Docker, Docker Compose

## 機能

### ユーザー向け (Shop Web)
- くじシリーズの閲覧
- くじの購入 (Stripe決済)
- 抽選結果の表示
- アニメーション付き演出

### 管理者向け (Admin Web)
- くじシリーズの作成・編集
- カード（景品）の管理
- 販売状況の確認
- ユーザー管理
- 画像・動画のアップロード

### API機能
- くじ購入処理
- 在庫管理（スロット管理）
- Stripe Webhook処理
- 画像アップロード（MinIO連携）
- 管理API

## セットアップ

### 前提条件

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (ローカル開発時)

### クイックスタート

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd webapp
```

2. **環境変数の設定**
```bash
cp .env.example .env
# .envファイルを編集して必要な環境変数を設定
```

3. **セットアップスクリプトの実行**
```bash
./setup.sh
```

4. **サービスの起動**
```bash
docker-compose up
```

または、バックグラウンドで起動:
```bash
docker-compose up -d
```

5. **アクセス**
- Shop Web: http://localhost:3000
- Admin Web: http://localhost:3001
- API: http://localhost:8000
- MinIO Console: http://localhost:9001

### 手動セットアップ

#### データベースの初期化

データベースは初回起動時に自動的に初期化されます。マイグレーションファイル:
```
db/migrations/001_create_tables.sql
```

#### MinIOの設定

1. MinIOコンソールにアクセス: http://localhost:9001
2. ログイン: `minioadmin` / `minioadmin`
3. バケット `lottery-assets` が自動作成されます

#### Stripe設定

1. [Stripe Dashboard](https://dashboard.stripe.com/)でAPIキーを取得
2. `.env`ファイルに設定:
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 開発

### ローカル開発環境

各アプリを個別に起動する場合:

#### API
```bash
cd apps/api
npm install
npm run dev
```

#### Shop Web
```bash
cd apps/shop-web
npm install
npm run dev
```

#### Admin Web
```bash
cd apps/admin-web
npm install
npm run dev
```

#### Worker
```bash
cd apps/worker
npm install
npm start
```

### 環境変数

主な環境変数 (`.env`):

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/lottery

# S3/MinIO
S3_ENDPOINT=http://minio:9000
S3_BUCKET=lottery-assets
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# URLs
SHOP_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
API_URL=http://localhost:8000
```

## データベーススキーマ

### 主要テーブル

- **series**: くじシリーズ情報
- **slots**: 購入可能なスロット（在庫管理）
- **assets**: 画像・動画ファイル情報
- **win_assignments**: 当選割当情報
- **stripe_events**: Stripeイベント記録（冪等性保証）
- **audit_logs**: 監査ログ

## API エンドポイント

### 購入API
- `POST /api/purchase/purchase` - くじ購入
- `GET /api/purchase/purchases/:id` - 購入情報取得

### 管理API
- `GET /api/admin/series` - シリーズ一覧
- `POST /api/admin/series` - シリーズ作成
- `GET /api/admin/cards` - カード一覧
- `POST /api/admin/cards` - カード作成

### Webhook
- `POST /api/webhook/stripe` - Stripe Webhook

### アップロード
- `POST /api/upload/image` - 画像アップロード
- `POST /api/upload/video` - 動画アップロード

## トラブルシューティング

### Dockerコンテナが起動しない

```bash
# ログを確認
docker-compose logs

# コンテナを再ビルド
docker-compose build --no-cache
docker-compose up
```

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker-compose ps db

# データベースログ確認
docker-compose logs db
```

### ポート競合エラー

既にポートが使用されている場合、`docker-compose.yml`のポート番号を変更してください。

## デプロイ

### 本番環境の構成

- API: AWS App Runner または ECS
- Frontend: Vercel または AWS Amplify
- Database: AWS RDS (PostgreSQL)
- Storage: AWS S3

### 環境変数の設定

本番環境では以下を設定:
- `NODE_ENV=production`
- 適切なデータベースURL
- 本番用Stripe APIキー
- セキュアなADMIN_PASSWORD

## ライセンス

Proprietary

## サポート

問題が発生した場合は、GitHubのIssueを作成してください。
