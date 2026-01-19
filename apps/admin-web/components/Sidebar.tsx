'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/dashboard', label: '📊 ダッシュボード' },
    { href: '/cards', label: '🎴 カード管理' },
    { href: '/sales', label: '💰 売上管理' },
    { href: '/users', label: '👥 ユーザー管理' },
    { href: '/series', label: '📦 シリーズ管理' },
    { href: '/upload', label: '🎬 動画アップロード' },
  ]

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Lottery Admin</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              pathname === item.href ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
