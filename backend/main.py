from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import yt_dlp
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

    # 1. Instagram Embed Method (Fast Video & Photo Extractor)
    if shortcode:
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
            "Accept": "*/*",
        }
        try:
            embed_url = f"https://www.instagram.com/p/{shortcode}/embed/captioned/"
            resp = requests.get(embed_url, headers=headers, timeout=8)
            if resp.status_code == 200:
                html = resp.text
                
                # Check for Video / Reel
                video_match = re.search(r'video_url\\":\\"([^"\\]+)', html) or re.search(r'"video_url":"([^"]+)"', html)
                if video_match:
                    clean_video_url = video_match.group(1).replace('\\u0026', '&').replace('\\/', '/')
                    return {
                        "media_url": clean_video_url,
                        "audio_url": clean_video_url, # MP4 contains the native audio track
                        "media_type": "video",
                        "thumbnail": "",
                        "title": "Instagram Media"
                    }

                # Check for Photo
                img_match = re.search(r'display_url\\":\\"([^"\\]+)', html) or re.search(r'"display_url":"([^"]+)"', html)
                if img_match:
                    clean_img_url = img_match.group(1).replace('\\u0026', '&').replace('\\/', '/')
                    return {
                        "media_url": clean_img_url,
                        "audio_url": None,
                        "media_type": "image",
                        "thumbnail": clean_img_url,
                        "title": "Instagram Photo"
                    }
        except Exception:
            pass

    # 2. yt-dlp Extractor
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            media_url = info.get('url')
            media_type = 'video'
            audio_url = None

            if not media_url and 'formats' in info:
                for f in reversed(info['formats']):
                    if f.get('url'):
                        media_url = f.get('url')
                        break

            if media_url:
                audio_url = media_url

            if not media_url and info.get('thumbnail'):
                media_url = info.get('thumbnail')
                media_type = 'image'

            if not media_url:
                raise HTTPException(status_code=400, detail="Could not extract media.")

            return {
                "media_url": media_url,
                "audio_url": audio_url,
                "media_type": media_type,
                "thumbnail": info.get('thumbnail', ''),
                "title": info.get('title', 'Instagram Media')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Instagram rate limit hit. Please retry in a moment.")
