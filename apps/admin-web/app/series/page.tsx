"use client"

import { useState, useEffect } from 'react'

interface Series {
  series_id: number
  name: string
  description: string
  price_jpy: number
  total_slots: number
  start_date: string
  end_date: string
  status: string
  animation_video_url?: string
  created_at: string
}

export default function SeriesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_jpy: 0,
    total_slots: 0,
    start_date: '',
    end_date: '',
    status: 'planned',
    animation_video_url: ''
  })

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/series`)
      if (res.ok) {
        const data = await res.json()
        setSeries(data)
      }
    } catch (error) {
      console.error('Failed to fetch series:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (s?: Series) => {
    if (s) {
      setEditingSeries(s)
      setFormData({
        name: s.name,
        description: s.description,
        price_jpy: s.price_jpy,
        total_slots: s.total_slots,
        start_date: s.start_date.split('T')[0],
        end_date: s.end_date.split('T')[0],
        status: s.status,
        animation_video_url: s.animation_video_url || ''
      })
    } else {
      setEditingSeries(null)
      setFormData({
        name: '',
        description: '',
        price_jpy: 0,
        total_slots: 0,
        start_date: '',
        end_date: '',
        status: 'planned',
        animation_video_url: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSeries(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSeries
        ? `${API_URL}/admin/series/${editingSeries.series_id}`
        : `${API_URL}/admin/series`
      const method = editingSeries ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        alert(editingSeries ? 'シリーズを更新しました' : 'シリーズを作成しました')
        handleCloseModal()
        fetchSeries()
      } else {
        const errorData = await res.json()
        alert(`エラー: ${errorData.detail || 'シリーズの保存に失敗しました'}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('エラーが発生しました')
    }
  }

  const handleDelete = async (seriesId: number) => {
    if (!confirm('本当に削除しますか？')) return
    try {
      const res = await fetch(`${API_URL}/admin/series/${seriesId}`, { method: 'DELETE' })
      if (res.ok) {
        alert('シリーズを削除しました')
        fetchSeries()
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  const rarityColors = {
    planned: 'bg-gray-500',
    active: 'bg-green-500',
    ended: 'bg-red-500'
  }

  if (loading) return <div className="p-8">読み込み中...</div>

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">シリーズ管理</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          新規作成
        </button>
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">名前</th>
              <th className="px-4 py-3 text-left">価格(円)</th>
              <th className="px-4 py-3 text-left">スロット数</th>
              <th className="px-4 py-3 text-left">ステータス</th>
              <th className="px-4 py-3 text-left">動画URL</th>
              <th className="px-4 py-3 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.series_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{s.series_id}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">¥{s.price_jpy}</td>
                <td className="px-4 py-3">{s.total_slots}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${rarityColors[s.status as keyof typeof rarityColors] || 'bg-gray-400'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.animation_video_url ? (
                    <span className="text-green-600">✓ 設定済み</span>
                  ) : (
                    <span className="text-gray-400">未設定</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleOpenModal(s)} className="text-blue-600 hover:underline mr-2">編集</button>
                  <button onClick={() => handleDelete(s.series_id)} className="text-red-600 hover:underline">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-4">
        {series.map((s) => (
          <div key={s.series_id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{s.name}</h3>
              <span className={`px-2 py-1 rounded-full text-white text-xs ${rarityColors[s.status as keyof typeof rarityColors] || 'bg-gray-400'}`}>
                {s.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{s.description}</p>
            <div className="text-sm space-y-1">
              <div>価格: ¥{s.price_jpy}</div>
              <div>スロット数: {s.total_slots}</div>
              <div>動画: {s.animation_video_url ? '✓ 設定済み' : '未設定'}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleOpenModal(s)} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg">編集</button>
              <button onClick={() => handleDelete(s.series_id)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg">削除</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingSeries ? 'シリーズ編集' : '新規シリーズ作成'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">シリーズ名</label>
                    <input
                      type="text"
                      placeholder="シリーズ名"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">説明</label>
                    <textarea
                      placeholder="説明"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">価格（円）</label>
                    <input
                      type="number"
                      placeholder="価格(円)"
                      value={formData.price_jpy}
                      onChange={(e) => setFormData({...formData, price_jpy: Number(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">スロット数</label>
                    <input
                      type="number"
                      placeholder="スロット数"
                      value={formData.total_slots}
                      onChange={(e) => setFormData({...formData, total_slots: Number(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">開始日</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">終了日</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">ステータス</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="planned">計画中</option>
                      <option value="active">進行中</option>
                      <option value="ended">終了</option>
                    </select>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block mb-2 font-semibold">🎬 抽選アニメーション動画URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/animation.mp4"
                      value={formData.animation_video_url}
                      onChange={(e) => setFormData({...formData, animation_video_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ※ アップロードページで動画をアップロードし、URLをここに貼り付けてください
                    </p>
                    {formData.animation_video_url && (
                      <a 
                        href="/upload" 
                        target="_blank" 
                        className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                      >
                        → 動画をアップロード
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    {editingSeries ? '更新' : '作成'}
                  </button>
                  <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
