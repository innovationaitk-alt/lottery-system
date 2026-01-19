"use client"

import { useState } from 'react'
import Link from 'next/link'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <html lang="ja">
      <body>
        <div className="flex h-screen bg-gray-100">
          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-30 flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">くじ管理システム</h1>
          </div>

          {/* Sidebar Overlay (Mobile) */}
          {isSidebarOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed md:static inset-y-0 left-0 z-50
            w-64 bg-blue-600 text-white p-6
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}>
            <h1 className="text-2xl font-bold mb-8 hidden md:block">くじ管理システム</h1>
            <nav className="space-y-4 mt-16 md:mt-0">
              <Link href="/dashboard" className="block py-2 px-4 hover:bg-blue-700 rounded" onClick={() => setIsSidebarOpen(false)}>
                📊 ダッシュボード
              </Link>
              <Link href="/series" className="block py-2 px-4 hover:bg-blue-700 rounded" onClick={() => setIsSidebarOpen(false)}>
                📋 シリーズ管理
              </Link>
              <Link href="/cards" className="block py-2 px-4 hover:bg-blue-700 rounded" onClick={() => setIsSidebarOpen(false)}>
                🃏 カード登録
              </Link>
              <Link href="/upload" className="block py-2 px-4 hover:bg-blue-700 rounded" onClick={() => setIsSidebarOpen(false)}>
                📤 アップロード
              </Link>
              <Link href="/purchases" className="block py-2 px-4 hover:bg-blue-700 rounded" onClick={() => setIsSidebarOpen(false)}>
                🛒 購入履歴
              </Link>
              <Link href="/audit-logs" className="block py-2 px-4 hover:bg-blue-700 rounded" onClick={() => setIsSidebarOpen(false)}>
                📝 監査ログ
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
