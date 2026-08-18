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

    # ==========================================
    # 1. YOUTUBE ENGINE (InnerTube Mobile API)
    # ==========================================
    if is_youtube:
        # Extract 11-character video ID
        vid_match = re.search(r'(?:v=|\/|shorts\/|youtu\.be\/)([0-9A-Za-z_-]{11})', url)
        if not vid_match:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL format.")
        
        video_id = vid_match.group(1)

        # Query YouTube InnerTube Android endpoint directly
        innertube_url = "https://www.youtube.com/youtubei/v1/player"
        payload = {
            "context": {
                "client": {
                    "clientName": "ANDROID",
                    "clientVersion": "19.09.37",
                    "androidSdkVersion": 30,
                    "hl": "en",
                    "gl": "US"
                }
            },
            "videoId": video_id
        }
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 11)"
        }

        try:
            res = requests.post(innertube_url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                streaming_data = data.get("streamingData", {})
                
                # Try combined formats first (video + audio in one MP4)
                formats = streaming_data.get("formats", [])
                video_url = None
                for f in reversed(formats):
                    if f.get("url") and "video/mp4" in f.get("mimeType", ""):
                        video_url = f.get("url")
                        break

                # Fallback to adaptive streams if formats list is empty
                if not video_url:
                    adaptive = streaming_data.get("adaptiveFormats", [])
                    for f in adaptive:
                        if f.get("url") and "video/mp4" in f.get("mimeType", ""):
                            video_url = f.get("url")
                            break
                    if not video_url and formats:
                        video_url = formats[0].get("url")

                title = data.get("videoDetails", {}).get("title", "YouTube Video")
                thumbnail = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"

                if video_url:
                    return {
                        "video_url": video_url,
                        "thumbnail": thumbnail,
                        "title": title
                    }
        except Exception as e:
            pass

        raise HTTPException(status_code=400, detail="Unable to retrieve YouTube stream. Please check the URL.")

    # ==========================================
    # 2. INSTAGRAM ENGINE (yt-dlp)
    # ==========================================
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
                raise HTTPException(status_code=400, detail="Unable to extract Instagram reel.")

            return {
                "video_url": video_url,
                "thumbnail": info.get('thumbnail', ''),
                "title": info.get('title', 'Instagram Reel')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
