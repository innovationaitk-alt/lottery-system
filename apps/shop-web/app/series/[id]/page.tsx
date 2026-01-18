'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Series } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params
        const seriesRes = await fetch(`${API_BASE_URL}/admin/series/${resolvedParams.id}`)
        if (!seriesRes.ok) throw new Error('シリーズ情報の取得に失敗しました')
        const seriesData = await seriesRes.json()
        setSeries(seriesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params])

  const handlePurchaseClick = () => {
    if (series && series.available_slots > 0) {
      setShowDialog(true)
    }
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
  }

  const handlePurchase = async () => {
    if (!series) return
    
    setIsPurchasing(true)
    try {
      const response = await fetch(`${API_BASE_URL}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ series_id: series.id })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '購入に失敗しました')
      }
      
      const result = await response.json()
      router.push(`/animation/${result.purchase_id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : '購入に失敗しました')
      setIsPurchasing(false)
      setShowDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">読み込み中...</div>
      </div>
    )
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error || 'シリーズが見つかりません'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white">
      {/* ヘッダー */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.push('/')}
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
          >
            ← 戻る
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* シリーズ情報カード */}
        <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/80 backdrop-blur-md rounded-3xl border-2 border-purple-400/50 shadow-2xl p-6 md:p-10 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* サムネイル */}
            <div className="flex justify-center items-center">
              {series.thumbnail_url ? (
                <Image
                  src={series.thumbnail_url}
                  alt={series.name}
                  width={400}
                  height={400}
                  className="rounded-2xl shadow-2xl border-4 border-purple-500/30"
                />
              ) : (
                <div className="w-full h-64 bg-gray-800/50 rounded-2xl flex items-center justify-center border-4 border-purple-500/30">
                  <span className="text-gray-500 text-xl">No Image</span>
                </div>
              )}
            </div>

            {/* シリーズ詳細 */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {series.name}
              </h1>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">{series.description}</p>

              {/* 価格と在庫 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-4 border border-purple-500/30">
                  <div className="text-gray-400 text-sm mb-1">価格</div>
                  <div className="text-yellow-400 text-3xl font-bold">¥{series.price.toLocaleString()}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-purple-500/30">
                  <div className="text-gray-400 text-sm mb-1">残り</div>
                  <div className="text-green-400 text-3xl font-bold">
                    {series.available_slots}/{series.total_slots}
                  </div>
                </div>
              </div>

              {/* 購入ボタン */}
              {series.available_slots > 0 ? (
                <button
                  onClick={handlePurchaseClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50 text-2xl"
                >
                  🎴 購入する
                </button>
              ) : (
                <div className="w-full bg-gray-700/50 text-gray-400 font-bold py-6 px-8 rounded-xl text-center text-2xl border-2 border-gray-600">
                  完売しました
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 購入確認ダイアログ */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl border-2 border-purple-400/50 p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">購入確認</h3>
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-purple-500/30">
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">🎴</div>
                <div className="text-gray-300 text-sm">次に利用可能なスロットが自動で割り当てられます</div>
              </div>
              <div className="border-t border-purple-500/30 pt-4 mt-4">
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>シリーズ</span>
                  <span className="font-semibold text-white">{series.name}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>価格</span>
                  <span className="font-bold text-yellow-400 text-xl">¥{series.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseDialog}
                disabled={isPurchasing}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300"
              >
                キャンセル
              </button>
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
              >
                {isPurchasing ? '処理中...' : '購入する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}