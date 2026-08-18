from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp

app = FastAPI()

# Allow frontend requests from all domains (Vercel)
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
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        # Bypass data-center bot verification
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'mweb', 'ios', 'tv_embedded'],
                'player_skip': ['webpage', 'configs'],
            }
        },
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(req.url, download=False)
            
            # Find the best playable stream URL
            video_url = info.get('url')
            if not video_url and 'formats' in info:
                # Prefer formats that contain both video and audio
                for f in reversed(info['formats']):
                    if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                        video_url = f.get('url')
                        break
                # Fallback to the last available stream
                if not video_url and info['formats']:
                    video_url = info['formats'][-1].get('url')

            thumbnail = info.get('thumbnail')
            title = info.get('title', 'Media Video')

            if not video_url:
                raise HTTPException(status_code=400, detail="Could not extract direct stream URL.")

            return {
                "video_url": video_url,
                "thumbnail": thumbnail,
                "title": title
            }
    except Exception as e:
        error_msg = str(e)
        if "Sign in to confirm" in error_msg:
            error_msg = "YouTube temporarily limited this video on the server. Please retry in a few seconds or try another link."
        raise HTTPException(status_code=400, detail=error_msg)
