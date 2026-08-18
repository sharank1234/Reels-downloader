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

    # --- YouTube Engine (Direct Public Gateway) ---
    if is_youtube:
        # Extract clean video ID
        vid_match = re.search(r'(?:v=|\/|shorts\/|youtu\.be\/)([0-9A-Za-z_-]{11})', url)
        if not vid_match:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL format.")
        
        video_id = vid_match.group(1)
        clean_url = f"https://www.youtube.com/watch?v={video_id}"

        apis = [
            "https://api.cobalt.tools",
            "https://cobalt-api.kwiatekm.tokyo",
            "https://api.wuk.sh"
        ]

        for base_api in apis:
            try:
                res = requests.post(
                    f"{base_api}/api/json",
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0"
                    },
                    json={
                        "url": clean_url,
                        "vQuality": "720",
                        "filenamePattern": "basic"
                    },
                    timeout=8
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

        # Secondary Rapid Invidious stream extraction
        try:
            inv_res = requests.get(
                f"https://inv.nadeko.net/api/v1/videos/{video_id}",
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=8
            )
            if inv_res.status_code == 200:
                inv_data = inv_res.json()
                formats = inv_data.get("formatStreams", [])
                if formats:
                    return {
                        "video_url": formats[-1].get("url"),
                        "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                        "title": inv_data.get("title", "YouTube Video")
                    }
        except Exception:
            pass

        raise HTTPException(status_code=400, detail="YouTube stream is busy. Please retry in a few seconds.")

    # --- Instagram Engine (yt-dlp works cleanly for Instagram) ---
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
                raise HTTPException(status_code=400, detail="Unable to extract video stream.")

            return {
                "video_url": video_url,
                "thumbnail": info.get('thumbnail', ''),
                "title": info.get('title', 'Instagram Reel')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
