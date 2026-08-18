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
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(req.url, download=False)
            
            # Extract highest quality direct video URL
            video_url = info.get('url')
            if not video_url and 'formats' in info:
                for f in reversed(info['formats']):
                    if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                        video_url = f.get('url')
                        break

            thumbnail = info.get('thumbnail')
            title = info.get('title', 'Media Video')

            if not video_url:
                raise HTTPException(status_code=400, detail="Could not extract video stream.")

            return {
                "video_url": video_url,
                "thumbnail": thumbnail,
                "title": title
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
