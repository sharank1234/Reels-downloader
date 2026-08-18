import React, { useState } from 'react'

export default function App() {
  const [activeTab, setActiveTab] = useState('instagram') // 'instagram' | 'youtube'
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'faq' | 'contact' | 'guide' | null

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
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch video details.')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Unable to connect to downloader server.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async () => {
    if (!result || !result.video_url) return
    setDownloading(true)
    try {
      const response = await fetch(result.video_url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${result.title || (activeTab === 'instagram' ? 'instagram_reel' : 'youtube_video')}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      window.open(result.video_url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, rgba(131,58,180,0.35) 0%, rgba(253,29,29,0.2) 50%, rgba(252,176,69,0.15) 100%), #090d16',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 16px 20px 16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Switchable Top Mode Tabs */}
        <div style={{
          display: 'flex',
          maxWidth: '440px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '16px',
          padding: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '28px',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => handleTabSwitch('instagram')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'all 0.2s ease',
              background: activeTab === 'instagram' 
                ? 'linear-gradient(135deg, #FF543E 0%, #FF2578 50%, #C92BEA 100%)' 
                : 'transparent',
              color: activeTab === 'instagram' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'instagram' ? '0 4px 15px rgba(255, 37, 120, 0.4)' : 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            <span>INSTAGRAM</span>
          </button>

          <button
            onClick={() => handleTabSwitch('youtube')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'all 0.2s ease',
              background: activeTab === 'youtube' 
                ? 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)' 
                : 'transparent',
              color: activeTab === 'youtube' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'youtube' ? '0 4px 15px rgba(255, 0, 0, 0.4)' : 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
            <span>YOUTUBE</span>
          </button>
        </div>

        {/* Dynamic Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            marginBottom: '12px',
            color: activeTab === 'instagram' ? '#fb7185' : '#f87171'
          }}>
            ✦ FAST & HIGH QUALITY
          </div>

          <h1 style={{
            fontSize: '34px',
            fontWeight: 900,
            letterSpacing: '-1px',
            background: activeTab === 'instagram'
              ? 'linear-gradient(135deg, #FF543E 0%, #FF2578 50%, #C92BEA 100%)'
              : 'linear-gradient(135deg, #FF4B4B 0%, #FF0000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0'
          }}>
            {activeTab === 'instagram' ? 'Reels Downloader' : 'YouTube Downloader'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
            {activeTab === 'instagram' 
              ? 'Paste any public Instagram Reel URL to fetch & download original MP4 video.'
              : 'Paste any YouTube video or Shorts link to fetch & download in high quality.'}
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
          boxSizing: 'border-box'
        }}>
          <form onSubmit={handleFetch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder={activeTab === 'instagram' ? 'Paste Instagram Reel URL...' : 'Paste YouTube or Shorts URL...'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                {activeTab === 'instagram' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
                )}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 20px',
                borderRadius: '14px',
                border: 'none',
                background: activeTab === 'instagram'
                  ? 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)'
                  : 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: activeTab === 'instagram' 
                  ? '0 10px 20px -5px rgba(236, 72, 153, 0.4)' 
                  : '0 10px 20px -5px rgba(239, 68, 68, 0.4)'
              }}
            >
              {loading ? (
                <svg className="spin-loader" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              )}
              {loading ? 'Processing Video...' : `Fetch ${activeTab === 'instagram' ? 'Reel' : 'Video'}`}
            </button>
          </form>

          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner Area */}
        {loading && (
          <div style={{
            marginTop: '20px',
            maxWidth: '460px',
            width: '100%',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '36px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}>
            <svg className="spin-loader" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'instagram' ? '#ec4899' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 600 }}>Fetching video details...</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Please wait a moment</span>
          </div>
        )}

        {/* Video Preview & Download Area */}
        {result && (
          <div style={{
            marginTop: '20px',
            maxWidth: '460px',
            width: '100%',
            background: 'rgba(30, 41, 59, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
              ✓ Video Found!
            </div>

            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', maxHeight: '320px' }}>
              <video
                src={result.video_url}
                poster={result.thumbnail}
                controls
                playsInline
                style={{ width: '100%', maxHeight: '320px', objectFit: 'contain' }}
              />
            </div>

            <p style={{
              fontSize: '14px',
              color: '#cbd5e1',
              fontWeight: 500,
              margin: 0,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {result.title || (activeTab === 'instagram' ? 'Instagram Reel' : 'YouTube Video')}
            </p>

            <button
              onClick={handleDownloadFile}
              disabled={downloading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 20px',
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: downloading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 18px -4px rgba(16, 185, 129, 0.4)'
              }}
            >
              {downloading ? (
                <svg className="spin-loader" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              )}
              {downloading ? 'Downloading...' : 'Download MP4 Video'}
            </button>
          </div>
        )}

      </div>

      {/* Accessible Footer Bar */}
      <footer style={{
        marginTop: '36px',
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(10px)',
          padding: '8px 14px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => setActiveModal('guide')}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px' }}
          >
            📖 How to use
          </button>

          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>

          <button
            onClick={() => setActiveModal('faq')}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px' }}
          >
            ❓ FAQ
          </button>

          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>

          <button
            onClick={() => setActiveModal('contact')}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✉️ Contact Support
          </button>
        </div>

        <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
          Media Downloader • Free & Unlimited Cloud Downloader
        </p>
      </footer>

      {/* Modals */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 999
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {activeModal === 'guide' && '📖 How to Download'}
                {activeModal === 'faq' && '❓ Frequently Asked Questions'}
                {activeModal === 'contact' && '💬 Contact & Help'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', padding: '6px 10px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {activeModal === 'guide' && (
              <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><strong>1. Choose Platform:</strong> Tap <em>INSTAGRAM</em> or <em>YOUTUBE</em> at the top.</div>
                <div><strong>2. Paste & Fetch:</strong> Paste your video/Shorts/Reel link and tap <em>Fetch</em>.</div>
                <div><strong>3. Save Video:</strong> Check the preview and tap <em>Download MP4 Video</em>.</div>
              </div>
            )}

            {activeModal === 'faq' && (
              <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>What formats are supported?
