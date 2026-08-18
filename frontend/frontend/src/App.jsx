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
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch media.')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Server connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.media_url) return
    setDownloading(true)
    const isImage = result.media_type === 'image'
    const extension = isImage ? 'jpg' : 'mp4'

    try {
      const res = await fetch(result.media_url)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `instagram_${isImage ? 'photo' : 'video'}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(result.media_url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, rgba(131,58,180,0.35) 0%, rgba(253,29,29,0.2) 50%, rgba(252,176,69,0.15) 100%), #090d16', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 40px', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Switchable Platform Tabs */}
        <div style={{ display: 'flex', width: '100%', background: 'rgba(15,23,42,0.8)', borderRadius: '16px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', boxSizing: 'border-box' }}>
          <button onClick={() => handleTabSwitch('instagram')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, background: activeTab === 'instagram' ? 'linear-gradient(135deg, #FF543E 0%, #FF2578 50%, #C92BEA 100%)' : 'transparent', color: '#fff' }}>INSTAGRAM</button>
          <button onClick={() => handleTabSwitch('youtube')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, background: activeTab === 'youtube' ? '#ef4444' : 'transparent', color: '#fff' }}>YOUTUBE</button>
        </div>

        {/* Dynamic Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: activeTab === 'instagram' ? '#ff3b81' : '#f87171', margin: '0 0 6px 0', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
            {activeTab === 'instagram' ? 'Instagram Downloader' : 'YouTube Downloader'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            {activeTab === 'instagram' ? 'Download Instagram Reels, Photos & Video Posts in High Quality.' : 'Paste public YouTube Video/Shorts URL.'}
          </p>
        </div>

        {/* Input Card */}
        <div style={{ width: '100%', background: 'rgba(30,41,59,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px', boxSizing: 'border-box' }}>
          <form onSubmit={handleFetch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder={activeTab === 'instagram' ? 'Paste Instagram Reel or Post link...' : 'Paste YouTube link...'} 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
            />
            <button 
              type="submit" 
              disabled={loading} 
              style={{ padding: '12px', borderRadius: '12px', border: 'none', background: activeTab === 'instagram' ? 'linear-gradient(90deg, #ec4899, #8b5cf6)' : '#ef4444', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Fetching Media...' : `Fetch ${activeTab === 'instagram' ? 'Instagram Media' : 'Media'}`}
            </button>
          </form>
          {error && <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>⚠️ {error}</div>}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ marginTop: '20px', width: '100%', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '36px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${activeTab === 'instagram' ? '#ec4899' : '#ef4444'}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600 }}>Fetching media from Instagram...</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Please wait a few seconds</span>
          </div>
        )}

        {/* Media Preview & Download */}
        {result && (
          <div style={{ marginTop: '20px', width: '100%', background: 'rgba(30,41,59,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
            <div style={{ color: '#4ade80', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>✓ Ready for Download</div>
            {result.media_type === 'image' ? (
              <img src={result.media_url} alt="Instagram Post" style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: '14px', backgroundColor: '#000' }} />
            ) : (
              <video src={result.media_url} poster={result.thumbnail} controls playsInline style={{ width: '100%', maxHeight: '340px', borderRadius: '14px', backgroundColor: '#000' }} />
            )}
            <button onClick={handleDownload} disabled={downloading} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #10b981, #059669)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: downloading ? 'not-allowed' : 'pointer' }}>
              {downloading ? 'Downloading...' : `Download ${result.media_type === 'image' ? 'JPG Photo' : 'MP4 Video'}`}
            </button>
          </div>
        )}

        {/* YouTube Lab Notice */}
        {activeTab === 'youtube' && !result && !loading && (
          <div style={{ marginTop: '22px', width: '100%', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(20, 10, 20, 0.85) 100%)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '24px', padding: '24px 20px', boxSizing: 'border-box', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🚀</div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fca5a5' }}>YouTube Engine In The Lab 🧪</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1' }}>We're currently building our next-generation lightning proxy pipeline to support 4K YouTube Shorts & Video ripping directly from the cloud. ⚡</p>
            <div style={{ padding: '6px 14px', background: 'rgba(239, 68, 68, 0.12)', borderRadius: '9999px', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '12px', fontWeight: 600, color: '#f87171' }}>🛠️ Feature Releasing Very Soon</div>
          </div>
        )}

        {/* ========================================================
            INSTAGRAM INFORMATION & VISUAL INSTRUCTIONS SECTION
           ======================================================== */}
        {activeTab === 'instagram' && (
          <div style={{ marginTop: '36px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Overview Card */}
            <div style={{ background: 'rgba(30, 41, 59, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '22px', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>✨</span>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ff3b81' }}>Instagram Reels Video Download</h2>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#cbd5e1', margin: '0 0 12px 0' }}>
                A free and fast tool for Instagram reels video download in HD. With this Instagram reels downloader, you can save reels video in MP4 high quality directly to your phone gallery without providing your login details. Enjoy 100% free and unlimited downloads whenever you want.
              </p>
              <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#94a3b8', margin: 0 }}>
                We do not require Instagram API access or sensitive personal credentials. You are free to use our download services completely anonymously without signing up or creating an account.
              </p>
            </div>

            {/* Key Features Grid */}
            <div style={{ background: 'rgba(30, 41, 59, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '22px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Key Features of Instagram Downloader
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '🚀', title: 'Free & Ultra-Fast', desc: 'Instant server processing with zero wait times.' },
                  { icon: '📱', title: 'No App Required', desc: 'Works directly in your mobile or desktop browser.' },
                  { icon: '🔒', title: 'No Login Credentials', desc: 'Never asks for passwords, usernames, or sign-ups.' },
                  { icon: '💾', title: 'Direct Gallery Save', desc: 'Saves crisp original MP4 videos right to your storage.' },
                  { icon: '♾️', title: 'Unlimited Downloads', desc: 'No daily limits or restrictions on media fetches.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Step-by-Step Guide Cards */}
            <div style={{ background: 'rgba(30, 41, 59, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '22px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📖</span> Ways to Download Instagram Reels Video
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 18px 0' }}>Follow these simple illustrated steps to download any public Instagram media in seconds:</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Step 1 */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>1</span>
                    <strong style={{ fontSize: '14px', color: '#fff' }}>Reels to Download</strong>
                  </div>
                  
                  {/* Step 1 Visual Vector Card */}
                  <div style={{ height: '110px', background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px dashed rgba(255,255,255,0.2)', marginBottom: '10px' }}>
                    <div style={{ fontSize: '28px' }}>📲 🔗</div>
                    <span style={{ fontSize: '11px', color: '#f472b6', fontWeight: 600 }}>Tap Share ➔ Tap "Copy link"</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                    Open the Instagram app, navigate to your favorite Reel or Post, tap the Share icon, and choose <strong>Copy Link</strong>.
                  </p>
                </div>

                {/* Step 2 */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>2</span>
                    <strong style={{ fontSize: '14px', color: '#fff' }}>Paste in Reels Downloader</strong>
                  </div>
                  
                  {/* Step 2 Visual Vector Card */}
                  <div style={{ height: '110px', background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px dashed rgba(255,255,255,0.2)', marginBottom: '10px' }}>
                    <div style={{ fontSize: '28px' }}>📋 ⚡</div>
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>Paste URL & Tap "Fetch Media"</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                    Paste the link into the input box above and tap <strong>Fetch Instagram Media</strong> to process your request in seconds.
                  </p>
                </div>

                {/* Step 3 */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>3</span>
                    <strong style={{ fontSize: '14px', color: '#fff' }}>Save Instagram Reels</strong>
                  </div>
                  
                  {/* Step 3 Visual Vector Card */}
                  <div style={{ height: '110px', background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(16,185,129,0.15))', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px dashed rgba(255,255,255,0.2)', marginBottom: '10px' }}>
                    <div style={{ fontSize: '28px' }}>🎬 💾</div>
                    <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>Preview Video ➔ Tap "Download MP4"</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                    Preview the extracted video and tap the green <strong>Download</strong> button. The media will save directly to your Downloads folder and gallery.
                  </p>
                </div>

              </div>
            </div>

            {/* Watermark-Free Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,78,59,0.25) 100%)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#4ade80' }}>Download Instagram Reels Video without Watermark</h3>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>
                Our downloader is engineered to provide original, watermark-free videos with 100% accuracy. Enjoy clean, high-bitrate MP4 downloads identical to the original creator's upload.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <footer style={{ marginTop: '40px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '14px', background: 'rgba(15,23,42,0.6)', padding: '6px 16px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px' }}>
          <button onClick={() => setActiveModal('guide')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>📖 Guide</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <button onClick={() => setActiveModal('faq')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>❓ FAQ</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
      
