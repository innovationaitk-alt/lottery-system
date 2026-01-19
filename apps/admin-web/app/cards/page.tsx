"use client"

import { useState, useEffect } from 'react'

interface Series {
  series_id: number
  name: string
}

interface Slot {
  slot_id: number
  slot_position: number
  card_name?: string
  card_image_url?: string
  card_value?: number
  rarity?: string
}

export default function CardsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [selectedSeries, setSelectedSeries] = useState<number>(0)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null)
  const [formData, setFormData] = useState({
    card_name: '',
    card_image_url: '',
    card_value: 0,
    rarity: 'コモン'
  })

  useEffect(() => {
    fetchSeries()
  }, [])

  useEffect(() => {
    if (selectedSeries > 0) {
      fetchSlots()
    } else {
      setSlots([])
    }
  }, [selectedSeries])

  const fetchSeries = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/series`)
      const data = await res.json()
      console.log('Series data:', data)
      setSeriesList(data)
    } catch (error) {
      console.error('Failed to fetch series:', error)
      alert('シリーズの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/series/${selectedSeries}/slots`)
      const data = await res.json()
      console.log('Slots data:', data)
      setSlots(data)
    } catch (error) {
      console.error('Failed to fetch slots:', error)
      alert('スロットの取得に失敗しました')
    }
  }

  const handleOpenModal = (slot: Slot) => {
    setCurrentSlot(slot)
    setFormData({
      card_name: slot.card_name || '',
      card_image_url: slot.card_image_url || '',
      card_value: slot.card_value || 0,
      rarity: slot.rarity || 'コモン'
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentSlot(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSlot) return
    
    try {
      console.log('Submitting card data:', formData)
      const res = await fetch(`${API_URL}/admin/slots/${currentSlot.slot_id}/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const responseData = await res.json()
      console.log('Response:', responseData)
      
      if (res.ok) {
        alert('カードを登録しました')
        handleCloseModal()
        fetchSlots()
      } else {
        alert(`エラー: ${responseData.detail || 'カード登録に失敗しました'}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('カード登録に失敗しました')
    }
  }

  const rarityColors: Record<string, string> = {
    'コモン': 'bg-gray-500',
    'アンコモン': 'bg-green-500',
    'レア': 'bg-blue-500',
    'エピック': 'bg-purple-500',
    '伝説': 'bg-orange-500'
  }

  if (loading) return <div className="p-8">読み込み中...</div>

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">カード登録</h1>

      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-700">シリーズを選択:</label>
        <select
          value={selectedSeries}
          onChange={(e) => {
            const value = Number(e.target.value)
            console.log('Selected series:', value)
            setSelectedSeries(value)
          }}
          className="w-full md:w-96 px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer"
        >
          <option value={0}>シリーズを選択してください</option>
          {seriesList.map((s) => (
            <option key={s.series_id} value={s.series_id}>{s.name}</option>
          ))}
        </select>
      </div>

      {selectedSeries === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">シリーズを選択してください</p>
        </div>
      )}

      {selectedSeries > 0 && slots.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">スロットが見つかりません</p>
        </div>
      )}

      {/* Desktop: Table */}
      {selectedSeries > 0 && slots.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">スロット位置</th>
                <th className="px-4 py-3 text-left">カード名</th>
                <th className="px-4 py-3 text-left">レアリティ</th>
                <th className="px-4 py-3 text-left">価値</th>
                <th className="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.slot_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{slot.slot_position}</td>
                  <td className="px-4 py-3">{slot.card_name || '未登録'}</td>
                  <td className="px-4 py-3">
                    {slot.rarity ? (
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${rarityColors[slot.rarity] || 'bg-gray-400'}`}>
                        {slot.rarity}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">{slot.card_value ? `¥${slot.card_value}` : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleOpenModal(slot)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      {slot.card_name ? '編集' : '登録'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile: Cards */}
      {selectedSeries > 0 && slots.length > 0 && (
        <div className="md:hidden space-y-4">
          {slots.map((slot) => (
            <div key={slot.slot_id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">スロット {slot.slot_position}</h3>
                {slot.rarity && (
                  <span className={`px-2 py-1 rounded-full text-white text-xs ${rarityColors[slot.rarity] || 'bg-gray-400'}`}>
                    {slot.rarity}
                  </span>
                )}
              </div>
              <div className="text-sm space-y-1 mb-3">
                <div>カード名: {slot.card_name || '未登録'}</div>
                <div>価値: {slot.card_value ? `¥${slot.card_value}` : '-'}</div>
              </div>
              <button
                onClick={() => handleOpenModal(slot)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg"
              >
                {slot.card_name ? '編集' : '登録'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">カード{currentSlot?.card_name ? '編集' : '登録'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">カード名</label>
                    <input
                      type="text"
                      placeholder="カード名"
                      value={formData.card_name}
                      onChange={(e) => setFormData({...formData, card_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">画像URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={formData.card_image_url}
                      onChange={(e) => setFormData({...formData, card_image_url: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">カード価値（円）</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={formData.card_value}
                      onChange={(e) => setFormData({...formData, card_value: Number(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">レアリティ</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="コモン">コモン</option>
                      <option value="アンコモン">アンコモン</option>
                      <option value="レア">レア</option>
                      <option value="エピック">エピック</option>
                      <option value="伝説">伝説</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    {currentSlot?.card_name ? '更新' : '登録'}
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
