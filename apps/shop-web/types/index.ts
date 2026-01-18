// シリーズ型定義
export interface Series {
  id: number
  name: string
  description: string
  price: number
  total_slots: number
  available_slots: number
  thumbnail_url: string
  created_at: string
}

// スロット型定義
export interface Slot {
  id: number
  slot_number: number
  is_purchased: boolean
  series_id: number
}

// 購入リクエスト型定義
export interface PurchaseRequest {
  series_id: number
  slot_id: number
}

// 購入レスポンス型定義
export interface PurchaseResponse {
  purchase_id: number
  message: string
}

// 購入データ型定義（結果表示用）
export interface PurchaseData {
  id: number
  series_id: number
  slot_id: number
  slot_number: number
  card_name: string
  card_image_url: string
  card_value: number
  card_rarity: string
  card_description: string
  animation_video_url: string | null
  purchased_at: string
}

// レアリティカラー定義
export const rarityColors: { [key: string]: string } = {
  UR: 'from-red-500 to-orange-500',
  SSR: 'from-orange-500 to-yellow-500',
  SR: 'from-blue-500 to-purple-500',
  R: 'from-green-500 to-teal-500',
}
