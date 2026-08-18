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

    # --- 1. YOUTUBE ENGINE (Multi-Mirror Stream Resolver) ---
    if is_youtube:
        vid_match = re.search(r'(?:v=|\/|shorts\/|youtu\.be\/)([0-9A-Za-z_-]{11})', url)
        if not vid_match:
            raise HTTPException(status_code=400, detail="Invalid YouTube link format.")
        
        video_id = vid_match.group(1)
        clean_url = f"https://www.youtube.com/watch?v={video_id}"

        # Method A: Cobalt Modern V10 Endpoints
        cobalt_endpoints = [
            "https://api.cobalt.tools",
            "https://cobalt.api.kwiatekm.tokyo",
            "https://cobalt-api.hyper.lol"
        ]
        for ep in cobalt_endpoints:
            try:
                res = requests.post(
                    ep,
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    json={"url": clean_url},
                    timeout=5
                )
                if res.status_code == 200:
                    data = res.json()
                    stream_url = data.get("url") or data.get("stream")
                    if stream_url:
                        return {
                            "video_url": stream_url,
                            "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                            "title": "YouTube Video"
                        }
            except Exception:
                continue

        # Method B: Piped & Invidious Direct Stream Mirrors
        stream_mirrors = [
            f"https://pipedapi.kavin.rocks/streams/{video_id}",
            f"https://api.piped.privacy.com.de/streams/{video_id}",
            f"https://invidious.nerdvpn.de/api/v1/videos/{video_id}",
            f"https://invidious.jing.rocks/api/v1/videos/{video_id}"
        ]
        for mirror in stream_mirrors:
            try:
                res = requests.get(mirror, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
                if res.status_code == 200:
                    data = res.json()
                    
                    # Piped format check
                    video_streams = data.get("videoStreams", [])
                    for stream in reversed(video_streams):
                        if stream.get("url") and stream.get("format") == "MPEG_4" and not stream.get("videoOnly"):
                            return {
                                "video_url": stream.get("url"),
                                "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                                "title": data.get("title", "YouTube Video")
                            }
                    
                    # Invidious format check
                    format_streams = data.get("formatStreams", [])
                    if format_streams:
                        return {
                            "video_url": format_streams[-1].get("url"),
                            "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                            "title": data.get("title", "YouTube Video")
                        }
            except Exception:
                continue

        raise HTTPException(status_code=400, detail="Unable to extract YouTube video. Please try again.")

    # --- 2. INSTAGRAM ENGINE (yt-dlp) ---
    ydl_opts = {
        'format': 'best',
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
                raise HTTPException(status_code=400, detail="Unable to extract Instagram reel.")

            return {
                "video_url": video_url,
                "thumbnail": info.get('thumbnail', ''),
                "title": info.get('title', 'Instagram Reel')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
