import React, { useState } from 'react'
import { Download, Loader2, Sparkles, Instagram, PlayCircle, AlertCircle, CheckCircle2 } from 'lucide-react'

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
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch video details.')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Unable to connect to downloader server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, rgba(131,58,180,0.3) 0%, rgba(253,29,29,0.2) 50%, rgba(252,176,69,0.15) 100%), #090d16',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Glow Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
          marginBottom: '16px',
          color: '#fb7185'
        }}>
          <Sparkles size={16} /> FAST & HIGH QUALITY
        </div>

        <h1 style={{
          fontSize: '38px',
          fontWeight: 900,
          letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #FF543E 0%, #FF2578 50%, #C92BEA 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 10px 0'
        }}>
          Reels Downloader
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
          Paste any Instagram Reel link below to download HD video instantly.
        </p>
      </div>

      {/* Main Glass Card */}
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '28px 20px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
      }}>
        
        <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Paste Instagram Reel URL here..."
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
                boxSizing: 'border-box',
                transition: 'all 0.2s ease'
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
              boxShadow: '0 10px 20px -5px rgba(236, 72, 153, 0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {loading ? 'Processing Video...' : 'Fetch Reel'}
          </button>
        </form>

        {/* Error Notification */}
        {error && (
          <div style={{
            marginTop: '18px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        {/* Video Result Card */}
        {result && (
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#4ade80',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={16} /> Video Ready for Download!
            </div>

            {result.thumbnail && (
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', maxHeight: '280px' }}>
                <img
                  src={result.thumbnail}
                  alt="Thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PlayCircle size={48} color="#ffffff" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }} />
                </div>
              </div>
            )}

            <p style={{
              fontSize: '14px',
              color: '#cbd5e1',
              fontWeight: 500,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {result.title || 'Instagram Reel'}
            </p>

            <a
              href={result.video_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 20px',
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '15px',
                boxShadow: '0 8px 18px -4px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Download size={18} /> Save MP4 Video
            </a>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <p style={{ marginTop: '28px', color: '#64748b', fontSize: '12px' }}>
        Free • Unlimited • Fast Cloud Processing
      </p>
    </div>
  )
                }
