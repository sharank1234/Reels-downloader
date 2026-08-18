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
    try {
      const res = await fetch(result.media_url)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `instagram_${isImage ? 'photo.jpg' : 'video.mp4'}`
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
          <div style={{ marginTop: '20px', width: '100%', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ width: '34px', height: '34px', border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${activeTab === 'instagram' ? '#ec4899' : '#ef4444'}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🚀</div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fca5a5' }}>YouTube Engine In The Lab 🧪</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1' }}>We're currently building our next-generation lightning proxy pipeline to support 4K YouTube Shorts & Video ripping directly from the cloud. ⚡</p>
            <div style={{ padding: '6px 14px', background: 'rgba(239, 68, 68, 0.12)', borderRadius: '9999px', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '12px', fontWeight: 600, color: '#f87171' }}>🛠️ Feature Releasing Very Soon</div>
          </div>
        )}

        {/* Instructions & Features Section */}
        {activeTab === 'instagram' && (
          <div style={{ marginTop: '30px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Overview */}
            <div style={{ background: 'rgba(30, 41, 59, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>✨</span>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ff3b81' }}>Instagram Reels Video Download</h2>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#cbd5e1', margin: '0 0 10px 0' }}>
                A free and fast tool for Instagram reels video download in HD. With this Instagram reels downloader, you can save reels video in MP4 high quality in your phone gallery without providing your login details. The Instagram reels downloader is a free service for everyone and you can unlimitedly download reels video as you want.
              </p>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#94a3b8', margin: 0 }}>
                The best part of Reels video downloader is that we do not use Instagram API, so you no need to worry about providing your credentials for downloading the reels video. You are free to use our reels video download services without creating an account for login or signup.
              </p>
            </div>

            {/* Key Features */}
            <div style={{ background: 'rgba(30, 41, 59, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#fff' }}>⚡ Key Feature of Instagram Reels Download</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  'Free and very fast providing reels downloading.',
                  'No need to download an additional app for download reels video.',
                  'No need to fill in your account detail for login or sign up.',
                  'Download Reel video any time and save it in your phone gallery.',
                  'No need to create an account.'
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px' }}>
                    <span style={{ color: '#ec4899', fontSize: '14px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Visual Guide */}
            <div style={{ background: 'rgba(30, 41, 59, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#fff' }}>📖 Ways to Download Instagram Reels Video</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>Just follow these simple steps to download Reels with visual guide:</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#f472b6' }}>1. Reels to Download</div>
                  <div style={{ height: '70px', background: 'rgba(236,72,153,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '8px' }}>📲 ➔ 🔗</div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>Open the IG app and copy your favourite Reels that you want to download. Just click on the share icon and then click on the copy link icon.</p>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#38bdf8' }}>2. Reels Downloader</div>
                  <div style={{ height: '70px', background: 'rgba(56,189,248,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '8px' }}>📋 ➔ ⚡</div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>Paste the link in the Reels Downloader and click search to start processing your request. The Reels downloader will prepare your Reels in seconds.</p>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#4ade80' }}>3. Save Instagram Reels</div>
                  <div style={{ height: '70px', background: 'rgba(74,222,128,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '8px' }}>🎬 ➔ 💾</div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>Click on the download button to download the Instagram Reels, and the Reels will be saved in your downloads folder or phone gallery. Now you can enjoy your high-quality downloaded Reels.</p>
                </div>
              </div>
            </div>

            {/* Watermark Notice */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,78,59,0.25))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '18px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#4ade80' }}>🛡️ Download Instagram Reels Video without Watermark</h3>
              <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>Reels downloader seamlessly removes the watermark from the video you download, providing you with the original high-quality Reels, watermark-free.</p>
            </div>

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
            {activeModal === 'guide' && <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>1. Paste any public Instagram link.<br/>2. Tap Fetch Instagram Media.<br/>3. Preview the media and tap Download.</div>}
            {activeModal === 'faq' && <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>• Supports Instagram Reels, Video posts, and Photo posts.<br/>• 100% free and unlimited downloads.</div>}
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
