"use client"

import { useState, useEffect } from 'react'

interface DashboardStats {
  total_series: number
  active_series: number
  total_slots: number
  registered_cards: number
  total_purchases: number
  total_revenue: number
}

export default function DashboardPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const [stats, setStats] = useState<DashboardStats>({
    total_series: 0,
    active_series: 0,
    total_slots: 0,
    registered_cards: 0,
    total_purchases: 0,
    total_revenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // 仮のデータ（API実装後に置き換え）
      // const res = await fetch(`${API_URL}/admin/dashboard/stats`)
      // if (res.ok) {
      //   const data = await res.json()
      //   setStats(data)
      // }
      
      // デモデータ
      setTimeout(() => {
        setStats({
          total_series: 5,
          active_series: 2,
          total_slots: 150,
          registered_cards: 120,
          total_purchases: 45,
          total_revenue: 135000
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">読み込み中...</div>

  const statCards = [
    { label: '総シリーズ数', value: stats.total_series, color: 'bg-blue-500', icon: '📋' },
    { label: '進行中シリーズ', value: stats.active_series, color: 'bg-green-500', icon: '▶️' },
    { label: '総スロット数', value: stats.total_slots, color: 'bg-purple-500', icon: '🎰' },
    { label: '登録カード数', value: stats.registered_cards, color: 'bg-orange-500', icon: '🃏' },
    { label: '総購入数', value: stats.total_purchases, color: 'bg-pink-500', icon: '🛒' },
    { label: '総売上（円）', value: `¥${stats.total_revenue.toLocaleString()}`, color: 'bg-red-500', icon: '💰' }
  ]

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">ダッシュボード</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.color} text-white rounded-lg shadow-lg p-6`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              <div className="text-right">
                <p className="text-sm opacity-90">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/series" className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold">シリーズ管理</div>
          </a>
          <a href="/cards" className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition">
            <div className="text-2xl mb-2">🃏</div>
            <div className="font-semibold">カード登録</div>
          </a>
          <a href="/purchases" className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition">
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-semibold">購入履歴</div>
          </a>
          <a href="/audit-logs" className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">監査ログ</div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">最近のアクティビティ</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold">新しいシリーズが作成されました</p>
              <p className="text-sm text-gray-600">2026年1月19日 10:30</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <span className="text-xl">🃏</span>
            <div>
              <p className="font-semibold">カードが登録されました</p>
              <p className="text-sm text-gray-600">2026年1月19日 09:15</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <span className="text-xl">🛒</span>
            <div>
              <p className="font-semibold">購入がありました</p>
              <p className="text-sm text-gray-600">2026年1月19日 08:45</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
