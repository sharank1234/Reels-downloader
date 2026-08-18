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
    is_youtube = bool(re.search(r'(youtube\.com|youtu\.be)', url))

    # --- 1. YouTube Mode ---
    if is_youtube:
        raise HTTPException(
            status_code=400, 
            detail="YouTube download pipeline is currently in development."
        )

    # --- 2. Instagram Mode (Reels, Video Posts & Photo Posts) ---
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            media_url = info.get('url')
            media_type = 'video'

            # If it's a photo or single-image post
            if not media_url:
                if 'entries' in info and len(info['entries']) > 0:
                    first_entry = info['entries'][0]
                    media_url = first_entry.get('url')
                elif 'formats' in info:
                    for f in reversed(info['formats']):
                        if f.get('url'):
                            media_url = f.get('url')
                            break

            # Fallback for image-only posts
            if not media_url and info.get('thumbnail'):
                media_url = info.get('thumbnail')
                media_type = 'image'

            if not media_url:
                raise HTTPException(status_code=400, detail="Unable to extract Instagram post media.")

            return {
                "media_url": media_url,
                "media_type": media_type,
                "thumbnail": info.get('thumbnail', ''),
                "title": info.get('title', 'Instagram Media')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
