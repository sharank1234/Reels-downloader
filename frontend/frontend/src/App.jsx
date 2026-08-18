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












import React, { useState } from 'react'
import { 
  Download, Loader2, Sparkles, Instagram, PlayCircle, 
  AlertCircle, CheckCircle2, HelpCircle, Mail, MessageCircleQuestion, X, ExternalLink, ShieldCheck
} from 'lucide-react'

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null) // 'faq' | 'contact' | 'guide' | null

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
      
      {/* Main Container */}
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

        {/* Input Card */}
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
          
          <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
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

          {/* Download Output */}
          {result && (
            <div style={{
              marginTop: '20px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Ready to Download!
              </div>

              {result.thumbnail && (
                <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', maxHeight: '240px' }}>
                  <img src={result.thumbnail} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayCircle size={44} color="#ffffff" />
                  </div>
                </div>
              )}

              <a
                href={result.video_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: '0 8px 18px -4px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Download size={16} /> Save MP4 Video
              </a>
            </div>
          )}

        </div>
      </div>

      {/* Accessible Footer Tools */}
      <footer style={{
        marginTop: '40px',
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px'
      }}>
        
        {/* Help Bar Buttons */}
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

      {/* Accessible Interactive Modals */}
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
            
            {/* Modal Header */}
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

            {/* Guide Content */}
            {activeModal === 'guide' && (
              <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><strong>1. Copy Reel URL:</strong> Open Instagram, tap the Share icon on any reel, and tap <em>Copy link</em>.</div>
                <div><strong>2. Paste & Fetch:</strong> Paste the link in the input box above and tap <em>Fetch Reel</em>.</div>
                <div><strong>3. Save Video:</strong> Tap the green <em>Save MP4 Video</em> button to download it directly to your device.</div>
              </div>
            )}

            {/* FAQ Content */}
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

            {/* Contact Content */}
            {activeModal === 'contact' && (
              <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0 }}>Encountering an issue or have feedback?</p>
                <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Developer Support</span>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', marginTop: '2px' }}>support@reelsdownloader.app</div>
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

    </div>
  )
            }

