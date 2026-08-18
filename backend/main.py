from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    
    # Check if URL is YouTube or Instagram
    is_youtube = bool(re.search(r'(youtube\.com|youtu\.be)', url))
    
    if is_youtube:
        ydl_opts = {
            'format': 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
            'quiet': True,
            'no_warnings': True,
            'noplaylist': True,
            'extractor_args': {
                'youtube': {
                    'player_client': ['android_vr', 'android', 'ios'],
                    'player_skip': ['webpage', 'configs', 'js'],
                }
            },
            'http_headers': {
                'User-Agent': 'com.google.android.apps.youtube.vr/1.37.21 (Linux; U; Android 10; Quest 2) gzip',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        }
    else:
        # Standard configuration for Instagram Reels
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'quiet': True,
            'no_warnings': True,
        }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            video_url = info.get('url')
            if not video_url and 'formats' in info:
                # Find the direct MP4 format
                for f in reversed(info['formats']):
                    if f.get('vcodec') != 'none' and f.get('url'):
                        video_url = f.get('url')
                        break

            thumbnail = info.get('thumbnail')
            title = info.get('title', 'Media Video')

            if not video_url:
                raise HTTPException(status_code=400, detail="Could not extract video link.")

            return {
                "video_url": video_url,
                "thumbnail": thumbnail,
                "title": title
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Download Error: {str(e)}")
