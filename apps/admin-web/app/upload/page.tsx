"use client"

import { useState } from 'react'

export default function UploadPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadResult('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('ファイルを選択してください')
      return
    }

    setUploading(true)
    setUploadResult('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setUploadResult(`アップロード成功！\nURL: ${data.url || data.file_url || 'URL不明'}`)
        setFile(null)
        // ファイル入力をリセット
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setUploadResult(`エラー: ${data.detail || 'アップロードに失敗しました'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadResult('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">動画・画像アップロード</h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">ファイルを選択:</label>
          <input
            id="file-input"
            type="file"
            accept="video/*,image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer"
          />
          {file && (
            <div className="mt-3 text-sm text-gray-600">
              <p>選択されたファイル: <span className="font-semibold">{file.name}</span></p>
              <p>サイズ: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>

        {uploadResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            uploadResult.includes('成功') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <pre className="whitespace-pre-wrap">{uploadResult}</pre>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 max-w-2xl">
        <h2 className="text-lg font-bold mb-3">📝 使い方</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• 動画ファイル、画像ファイルをアップロードできます</li>
          <li>• アップロード後、URLが表示されます</li>
          <li>• そのURLをカード登録の「画像URL」に貼り付けてください</li>
        </ul>
      </div>
    </div>
  )
}
