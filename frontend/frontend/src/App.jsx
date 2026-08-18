import React, { useState } from 'react'
import { 
  Download, Loader2, Sparkles, Instagram, 
  AlertCircle, CheckCircle2, HelpCircle, Mail, MessageCircleQuestion, X
} from 'lucide-react'

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  
  // Modal states: 'faq' | 'contact' | 'guide' | null
  const [activeModal, setActiveModal] = useState(null)

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
      a.download = `${result.title || 'instagram_reel'}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      // Fallback if CORS blocks blob download
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
      padding: '32px 16px 20px 16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      
      {/* Header & Main Form Area */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Glow Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            marginBottom: '14px',
            color: '#fb7185'
          }}>
            <Sparkles size={16} /> FAST & HIGH QUALITY
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: 900,
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #FF543E 0%, #FF2578 50%, #C92BEA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0'
          }}>
            Reels Downloader
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
            Paste any public Instagram Reel URL to fetch & download original MP4 video.
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
        }}>
          
          <form onSubmit={handleFetch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Paste Instagram Reel URL..."
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
              <Instagram size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#f43f5e' }} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 20px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 20px -5px rgba(236, 72, 153, 0.4)'
              }}
            >
              {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} /> : <Download size={20} />}
              {loading ? 'Processing Video...' : 'Fetch Reel'}
            </button>
          </form>

          {/* Error Banner */}
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
              <AlertCircle size={18} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* LOADING STATE in marked area */}
        {loading && (
          <div style={{
            marginTop: '20px',
            maxWidth: '480px',
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
            <Loader2 size={36} color="#ec4899" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 600 }}>Fetching video from Instagram...</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Please wait a few seconds</span>
          </div>
        )}

        {/* VIDEO DISPLAY & DOWNLOAD AREA (Marked area) */}
        {result && (
          <div style={{
            marginTop: '20px',
            maxWidth: '480px',
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
              <CheckCircle2 size={16} /> Video Found!
            </div>

            {/* Video Player */}
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', maxHeight: '340px' }}>
              <video
                src={result.video_url}
                poster={result.thumbnail}
                controls
                playsInline
                style={{ width: '100%', maxHeight: '340px', objectFit: 'contain' }}
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
              {result.title || 'Instagram Reel'}
            </p>

            {/* Direct Download Action Button */}
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
              {downloading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
              {downloading ? 'Downloading...' : 'Download MP4 Video'}
            </button>
          </div>
        )}

      </div>

      {/* Accessible Footer Help Tools */}
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
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            <HelpCircle size={15} color="#38bdf8" /> How to use
          </button>

          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>

          <button
            onClick={() => setActiveModal('faq')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            <MessageCircleQuestion size={15} color="#a78bfa" /> FAQ
          </button>

          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>

          <button
            onClick={() => setActiveModal('contact')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            <Mail size={15} color="#f43f5e" /> Contact Support
          </button>
        </div>

        <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
          Reels Downloader • Secure & Free Tool
        </p>
      </footer>

      {/* Interactive Modals */}
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
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#fff', padding: '6px', cursor: 'pointer', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            {activeModal === 'guide' && (
              <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><strong>1. Copy Reel URL:</strong> Open Instagram, tap the Share icon on any reel, and tap <em>Copy link</em>.</div>
                <div><strong>2. Paste & Fetch:</strong> Paste the link in the input box above and tap <em>Fetch Reel</em>.</div>
                <div><strong>3. Preview & Save:</strong> Watch the preview and tap <em>Download MP4 Video</em> to save it to your device.</div>
              </div>
            )}

            {activeModal === 'faq' && (
              <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Does this work with private accounts?</strong>
                  <p style={{ margin: '2px 0 0 0', color: '#94a3b8' }}>No, only public Instagram Reels can be fetched.</p>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Is there a download limit?</strong>
                  <p style={{ margin: '2px 0 0 0', color: '#94a3b8' }}>No limits. It is 100% free and unlimited.</p>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Where are the files saved?</strong>
                  <p style={{ margin: '2px 0 0 0', color: '#94a3b8' }}>Directly to your phone gallery or computer Downloads folder.</p>
                </div>
              </div>
            )}

            {activeModal === 'contact' && (
              <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0 }}>Encountering an issue or have feedback?</p>
                <div style={{ background: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Developer Support</span>
                  <a 
                    href="mailto:karthiksharan208@gmail.com" 
                    style={{ color: '#38bdf8', fontWeight: 'bold', marginTop: '4px', display: 'block', textDecoration: 'none' }}
                  >
                    karthiksharan208@gmail.com
                  </a>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    marginTop: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: '#334155',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Global CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}
