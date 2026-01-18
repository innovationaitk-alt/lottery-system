'use client';
export default function UploadPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">動画アップロード</h1>
      <p className="text-gray-500 mb-4">S3アップロード機能は後日実装予定です</p>
      <div className="bg-white p-6 rounded-lg shadow">
        <input type="file" accept="video/*" className="mb-4" disabled />
        <button className="px-6 py-2 bg-gray-300 rounded" disabled>アップロード</button>
      </div>
    </div>
  );
}