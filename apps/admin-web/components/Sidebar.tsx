'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: '📊' },
    { href: '/cards', label: 'カード管理', icon: '🎴' },
    { href: '/sales', label: '売上管理', icon: '💰' },
    { href: '/users', label: 'ユーザー管理', icon: '👥' },
    { href: '/series', label: 'シリーズ管理', icon: '📦' },
    { href: '/upload', label: '動画アップロード', icon: '🎬' },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-2xl">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
          🎰 Lottery
        </h1>
        <p className="text-blue-300 text-sm mt-1">Admin Dashboard</p>
      </div>
      
      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 mb-2 rounded-lg
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-white text-blue-900 shadow-lg scale-105' 
                  : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                }
              `}
            >
              <span className={`text-2xl transition-transform group-hover:scale-110 ${isActive ? 'animate-bounce' : ''}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <span className="ml-auto">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-blue-700 bg-blue-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-blue-300">管理者</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
