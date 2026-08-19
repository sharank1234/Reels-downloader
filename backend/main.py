from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import yt_dlp
import html
import re
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DownloadRequest(BaseModel):
    url: str

@app.get("/")
def read_root():
    return {"status": "Backend is live"}

# Dedicated Image/Audio Proxy
@app.get("/api/proxy-image")
def proxy_image(img_url: str = Query(...)):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "*/*"
        }
        res = requests.get(img_url, headers=headers, stream=True, timeout=10)
        if res.status_code == 200:
            return StreamingResponse(
                io.BytesIO(res.content),
                media_type="image/jpeg",
                headers={"Cache-Control": "public, max-age=86400"}
            )
        raise HTTPException(status_code=400, detail="Failed to fetch stream.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def extract_instagram_shortcode(url: str):
    match = re.search(r'(?:reel|p|reels)\/([A-Za-z0-9_-]+)', url)
    return match.group(1) if match else None

@app.post("/api/download")
def download_media(req: DownloadRequest):
    url = req.url.strip()
    is_youtube = bool(re.search(r'(youtube\.com|youtu\.be)', url))

    if is_youtube:
        raise HTTPException(status_code=400, detail="YouTube downloader is in development.")

    shortcode = extract_instagram_shortcode(url)
    is_reel_link = bool(re.search(r'(?:reel|reels)\/', url))

    # --- Strategy 1: Instagram Embed Scraper with Full Entity Decoding ---
    if shortcode:
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        try:
            embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"
            resp = requests.get(embed_url, headers=headers, timeout=8)
            if resp.status_code == 200:
                raw_html = resp.text
                # Decode all HTML entities (&quot;, &#x2F;, etc.)
                clean_text = html.unescape(raw_html)

                # Look for video URL patterns
                video_patterns = [
                    r'video_url[\"\']\s*:\s*[\"\']([^\"\']+)[\"\']',
                    r'class=[\"\']EmbeddedVideo[\"\'][^>]*src=[\"\']([^\"\']+)[\"\']',
                    r'<video[^>]+src=[\"\']([^\"\']+)[\"\']',
                    r'video_url\\":\\"([^"\\]+)\\"'
                ]

                video_url = None
                for pattern in video_patterns:
                    match = re.search(pattern, clean_text) or re.search(pattern, raw_html)
                    if match:
                        candidate = match.group(1).replace('\\/', '/').replace('\\u0026', '&').replace('&amp;', '&')
                        if candidate.startswith('http'):
                            video_url = candidate
                            break

                if video_url:
                    return {
                        "media_url": video_url,
                        "audio_url": video_url,
                        "media_type": "video",
                        "thumbnail": "",
                        "title": "Instagram Reel"
                    }

                # If it is strictly a photo post and NOT a reel link
                if not is_reel_link:
                    img_patterns = [
                        r'display_url[\"\']\s*:\s*[\"\']([^\"\']+)[\"\']',
                        r'class=[\"\']EmbeddedMediaImage[\"\'][^>]*src=[\"\']([^\"\']+)[\"\']',
                        r'<img[^>]+class=[\"\'][^\"\']*EmbeddedMediaImage[^\"\']*[\"\'][^>]+src=[\"\']([^\"\']+)[\"\']',
                        r'display_url\\":\\"([^"\\]+)\\"'
                    ]
                    for pattern in img_patterns:
                        match = re.search(pattern, clean_text) or re.search(pattern, raw_html)
                        if match:
                            candidate = match.group(1).replace('\\/', '/').replace('\\u0026', '&').replace('&amp;', '&')
                            if candidate.startswith('http'):
                                return {
                                    "media_url": candidate,
                                    "audio_url": None,
                                    "media_type": "image",
                                    "thumbnail": candidate,
                                    "title": "Instagram Photo"
                                }
        except Exception:
            pass

    # --- Strategy 2: yt-dlp Extractor ---
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            media_url = info.get('url')
            media_type = 'video' if is_reel_link else 'image'

            if not media_url and 'formats' in info:
                for f in reversed(info['formats']):
                    if f.get('vcodec') != 'none' and f.get('url'):
                        media_url = f.get('url')
                        media_type = 'video'
                        break

            if not media_url and info.get('thumbnail') and not is_reel_link:
                media_url = info.get('thumbnail')
                media_type = 'image'

            if not media_url:
                raise HTTPException(status_code=400, detail="Could not extract media stream.")

            return {
                "media_url": media_url,
                "audio_url": media_url if media_type == 'video' else None,
                "media_type": media_type,
                "thumbnail": info.get('thumbnail', ''),
                "title": info.get('title', 'Instagram Media')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Unable to fetch Reel. Please check link or retry.")
