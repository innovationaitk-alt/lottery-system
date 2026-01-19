'use client'

import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalUsers: 0
  })

  useEffect(() => {
    fetch(`${API_URL}/admin/purchases`)
      .then(res => res.json())
      .then(purchases => {
        const totalSales = purchases.reduce((sum: number, p: any) => sum + (p.card_value || 0), 0)
        setStats({
          totalSales,
          totalPurchases: purchases.length,
          totalUsers: 0
        })
      })
      .catch(err => console.error(err))
  }, [])

  const cards = [
    { 
      title: '総売上', 
      value: `¥${stats.totalSales.toLocaleString()}`, 
      icon: '💰',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    { 
      title: '購入件数', 
      value: stats.totalPurchases, 
      icon: '🎫',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      title: 'ユーザー数', 
      value: stats.totalUsers, 
      icon: '👥',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 ダッシュボード</h1>
        <p className="text-gray-600">システム全体の概要を確認できます</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">{card.icon}</span>
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.color} opacity-20`}></div>
            </div>
            <h2 className={`text-sm font-medium ${card.textColor} mb-1`}>{card.title}</h2>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white hover:bg-blue-50 text-blue-700 font-medium py-3 px-4 rounded-lg shadow hover:shadow-md transition-all">
            ➕ カード追加
          </button>
          <button className="bg-white hover:bg-green-50 text-green-700 font-medium py-3 px-4 rounded-lg shadow hover:shadow-md transition-all">
            📊 レポート
          </button>
          <button className="bg-white hover:bg-purple-50 text-purple-700 font-medium py-3 px-4 rounded-lg shadow hover:shadow-md transition-all">
            ⚙️ 設定
          </button>
          <button className="bg-white hover:bg-orange-50 text-orange-700 font-medium py-3 px-4 rounded-lg shadow hover:shadow-md transition-all">
            📤 エクスポート
          </button>
        </div>
      </div>
    </div>
  )
}
