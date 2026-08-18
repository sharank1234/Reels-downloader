import React, { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleDownload = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const apiUrl = import.meta.env.VITE_API_URL || ''

    try {
      const res = await fetch(`${apiUrl}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Download failed')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>Reels Downloader</h1>
        <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Paste Instagram Reel Link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {loading ? 'Fetching...' : 'Get Video'}
          </button>
        </form>

        {error && <p style={{ color: '#ef4444', marginTop: '16px', textAlign: 'center' }}>{error}</p>}

        {result && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {result.thumbnail && <img src={result.thumbnail} alt="Thumbnail" style={{ width: '100%', borderRadius: '8px', maxHeight: '250px', objectFit: 'cover' }} />}
            <a
              href={result.video_url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', marginTop: '16px', padding: '12px', backgroundColor: '#22c55e', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}
            >
              Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
