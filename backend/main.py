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

    # ENGINE 1: YouTube Resolver (Bypasses Data-Center IP Blocks)
    if is_youtube:
        try:
            # Using public cobalt instance for YouTube streaming bypass
            res = requests.post(
                "https://api.cobalt.tools/api/json",
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                json={
                    "url": url,
                    "vQuality": "720",
                    "filenamePattern": "basic"
                },
                timeout=12
            )
            
            data = res.json()
            if res.status_code == 200 and ("url" in data or "stream" in data):
                stream_url = data.get("url") or data.get("stream")
                return {
                    "video_url": stream_url,
                    "thumbnail": "",
                    "title": "YouTube Video"
                }
        except Exception:
            pass  # Fallback to local yt-dlp if external gateway is busy

    # ENGINE 2: yt-dlp (Native Engine for Instagram Reels & Fallback)
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
