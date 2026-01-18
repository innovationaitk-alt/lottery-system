'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface PurchaseData {
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

export default function AnimationPage() {
  const params = useParams()
  const router = useRouter()
  const [purchase, setPurchase] = useState<PurchaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const res = await fetch(`${API_URL}/api/purchases/${params.id}`)
        if (!res.ok) throw new Error('購入情報の取得に失敗しました')
        const data = await res.json()
        setPurchase(data)
        
        // 動画がない場合は3秒後に結果ページへ
        if (!data.animation_video_url) {
          setTimeout(() => {
            router.push(`/result/${params.id}`)
          }, 3000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchase()
  }, [params.id, API_URL, router])

  const handleVideoEnd = () => {
    router.push(`/result/${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white text-xl">準備中...</p>
        </div>
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">❌ {error || '購入情報が見つかりません'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            トップへ戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
      {purchase.animation_video_url ? (
        <video
          autoPlay
          onEnded={handleVideoEnd}
          className="max-w-4xl w-full"
        >
          <source src={purchase.animation_video_url} type="video/mp4" />
          お使いのブラウザは動画再生に対応していません。
        </video>
      ) : (
        <div className="text-center text-white">
          <div className="animate-pulse text-6xl mb-4">🎁</div>
          <p className="text-2xl">結果を表示します...</p>
        </div>
      )}
    </div>
  )
}