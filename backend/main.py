from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import yt_dlp
import re

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

@app.post("/api/download")
def download_media(req: DownloadRequest):
    url = req.url.strip()
    is_youtube = bool(re.search(r'(youtube\.com|youtu\.be)', url))

    # --- YouTube Gateway (Bypasses Cloud Bot Detection) ---
    if is_youtube:
        gateways = [
            "https://co.wuk.sh/api/json",
            "https://api.cobalt.tools/api/json"
        ]
        
        for gw in gateways:
            try:
                response = requests.post(
                    gw,
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    },
                    json={
                        "url": url,
                        "vQuality": "720",
                        "filenamePattern": "basic"
                    },
                    timeout=10
                )
                if response.status_code == 200:
                    data = response.json()
                    stream_url = data.get("url") or data.get("stream")
                    if stream_url:
                        return {
                            "video_url": stream_url,
                            "thumbnail": "",
                            "title": "YouTube Video"
                        }
            except Exception:
                continue

    # --- Instagram Engine & Fallback (yt-dlp) ---
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            video_url = info.get('url')

            if not video_url and 'formats' in info:
                for f in reversed(info['formats']):
                    if f.get('vcodec') != 'none' and f.get('url'):
                        video_url = f.get('url')
                        break

            if not video_url:
                raise HTTPException(status_code=400, detail="Unable to extract video stream.")

            return {
                "video_url": video_url,
                "thumbnail": info.get('thumbnail', ''),
                "title": info.get('title', 'Media Video')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
