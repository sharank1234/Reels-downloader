import React, { useState } from 'react'

export default function App() {
  const [activeTab, setActiveTab] = useState('instagram')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setUrl('')
    setResult(null)
    setError('')
  }

  const handleFetch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    const apiUrl = import.meta.env.VITE_API_URL || ''
    try {
      const res = await fetch(`${apiUrl}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch video.')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Server connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.video_url) return
    setDownloading(true)
    try {
      const res = await fetch(result.video_url)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${result.title || 'media_video'}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(result.video_url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, rgba(131,58,180,0.35) 0%, rgba(253,29,29,0.2) 50%, rgba(252,176,69,0.15) 100%), #090d16', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px 20px', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Platform Switcher */}
        <div style={{ display: 'flex', maxWidth: '420px', width: '100%', background: 'rgba(15,23,42,0.8)', borderRadius: '16px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', boxSizing: 'border-box' }}>
          <button onClick={() => handleTabSwitch('instagram')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, background: activeTab === 'instagram' ? 'linear-gradient(135deg, #FF543E 0%, #FF2578 50%, #C92BEA 100%)' : 'transparent', color: '#fff' }}>INSTAGRAM</button>
          <button onClick={() => handleTabSwitch('youtube')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, background: activeTab === 'youtube' ? '#ef4444' : 'transparent', color: '#fff' }}>YOUTUBE</button>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 900, color: activeTab === 'instagram' ? '#ff3b81' : '#f87171', margin: '0 0 6px 0', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
            {activeTab === 'instagram' ? 'Reels Downloader' : 'YouTube Downloader'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Paste public {activeTab === 'instagram' ? 'Instagram Reel' : 'YouTube Video/Shorts'} URL.
          </p>
        </div>

        {/* Search Card */}
        <div style={{ maxWidth: '440px', width: '100%', background: 'rgba(30,41,59,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px', boxSizing: 'border-box' }}>
          <form onSubmit={handleFetch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder={`Paste ${activeTab === 'instagram' ? 'Instagram Reel' : 'YouTube'} link...`} value={url} onChange={(e) => setUrl(e.target.value)} required style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: activeTab === 'instagram' ? 'linear-gradient(90deg, #ec4899, #8b5cf6)' : '#ef4444', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Processing Video...' : 'Fetch Media'}</button>
          </form>
          {error && <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>⚠️ {error}</div>}
        </div>

        {/* Video Preview & Download */}
        {result && (
          <div style={{ marginTop: '20px', maxWidth: '440px', width: '100%', background: 'rgba(30,41,59,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
            <div style={{ color: '#4ade80', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>✓ Ready for Download</div>
            <video src={result.video_url} poster={result.thumbnail} controls playsInline style={{ width: '100%', maxHeight: '300px', borderRadius: '14px', backgroundColor: '#000' }} />
            <button onClick={handleDownload} disabled={downloading} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #10b981, #059669)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: downloading ? 'not-allowed' : 'pointer' }}>{downloading ? 'Downloading...' : 'Download MP4 Video'}</button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <footer style={{ marginTop: '30px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '14px', background: 'rgba(15,23,42,0.6)', padding: '6px 16px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
          <button onClick={() => setActiveModal('guide')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>📖 Guide</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <button onClick={() => setActiveModal('faq')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>❓ FAQ</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <button onClick={() => setActiveModal('contact')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>✉️ Support</button>
        </div>
        <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Free Cloud Media Downloader</p>
      </footer>

      {/* Modal Dialog */}
      {activeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 999 }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '18px', width: '100%', maxWidth: '400px', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{activeModal === 'guide' ? '📖 How to Use' : activeModal === 'faq' ? '❓ FAQ' : '💬 Support'}</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
            </div>
            {activeModal === 'guide' && <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>1. Choose Instagram or YouTube above.<br/>2. Paste the link and tap Fetch Media.<br/>3. Preview the video and tap Download MP4.</div>}
            {activeModal === 'faq' && <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>• Supports public Instagram Reels and YouTube videos/Shorts.<br/>• 100% free and unlimited downloads.</div>}
            {activeModal === 'contact' && (
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                <p style={{ margin: '0 0 10px 0' }}>Need help or encountered an issue?</p>
                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>Support Email</span>
                  <a href="mailto:karthiksharan208@gmail.com" style={{ color: '#38bdf8', fontWeight: 700, display: 'block', marginTop: '2px', textDecoration: 'none' }}>karthiksharan208@gmail.com</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
