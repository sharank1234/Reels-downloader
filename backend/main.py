import os
import re
import uuid
import shutil
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
import yt_dlp

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("insta-downloader")

app = FastAPI(title="Instagram Media Downloader")

# Allow the frontend dev server / your deployed frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOAD_DIR = Path("downloads")
DOWNLOAD_DIR.mkdir(exist_ok=True)

INSTAGRAM_URL_RE = re.compile(
    r"^https?://(www\.)?instagram\.com/(p|reel|reels|tv)/[A-Za-z0-9_-]+/?"
)


class MediaRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_instagram_url(cls, v: str) -> str:
        v = v.strip()
        if not INSTAGRAM_URL_RE.match(v):
            raise ValueError("Not a valid Instagram post/reel/tv URL")
        return v


class MediaResponse(BaseModel):
    id: str
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    media_type: str  # "video" or "image" or "carousel"
    download_url: str


def cleanup_old_files(max_age_seconds: int = 3600):
    """Remove files older than max_age_seconds from the downloads dir."""
    import time
    now = time.time()
    for f in DOWNLOAD_DIR.glob("*"):
        if f.is_file() and now - f.stat().st_mtime > max_age_seconds:
            try:
                f.unlink()
            except OSError:
                pass


@app.post("/api/extract", response_model=MediaResponse)
def extract_media(payload: MediaRequest):
    """
    Validates the URL, uses yt-dlp to extract info, downloads the media
    server-side into a temp folder, and returns a download link + metadata.
    """
    cleanup_old_files()

    job_id = str(uuid.uuid4())
    outtmpl = str(DOWNLOAD_DIR / f"{job_id}.%(ext)s")

    ydl_opts = {
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "format": "best",
        # If you need to access private/age-gated content you own,
        # you can point to a cookies file exported from your own browser:
        # "cookiefile": os.getenv("IG_COOKIES_FILE"),
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(payload.url, download=True)
    except yt_dlp.utils.DownloadError as e:
        msg = str(e).lower()
        if "private" in msg:
            raise HTTPException(status_code=403, detail="This post is private or requires login.")
        if "unsupported url" in msg or "unable to extract" in msg:
            raise HTTPException(status_code=400, detail="Could not read this link. It may be broken or unsupported.")
        logger.warning(f"yt-dlp failed for {payload.url}: {e}")
        raise HTTPException(status_code=422, detail="Failed to extract media from this link.")
    except Exception as e:
        logger.exception("Unexpected extraction error")
        raise HTTPException(status_code=500, detail="Unexpected server error while processing the link.")

    if not info:
        raise HTTPException(status_code=422, detail="No media found at this URL.")

    # Determine the actual file written to disk
    ext = info.get("ext", "mp4")
    actual_file = DOWNLOAD_DIR / f"{job_id}.{ext}"
    if not actual_file.exists():
        # yt-dlp sometimes merges/remuxes; check for common alternatives
        candidates = list(DOWNLOAD_DIR.glob(f"{job_id}.*"))
        if not candidates:
            raise HTTPException(status_code=500, detail="Media was processed but the file could not be located.")
        actual_file = candidates[0]

    media_type = "video" if actual_file.suffix.lower() in (".mp4", ".mov", ".webm") else "image"

    return MediaResponse(
        id=job_id,
        title=info.get("title") or info.get("description", "")[:80],
        thumbnail=info.get("thumbnail"),
        media_type=media_type,
        download_url=f"/api/download/{actual_file.name}",
    )


@app.get("/api/download/{filename}")
def download_file(filename: str):
    # Prevent path traversal
    safe_name = os.path.basename(filename)
    file_path = DOWNLOAD_DIR / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or has expired. Please try again.")

    return FileResponse(
        path=file_path,
        filename=safe_name,
        media_type="application/octet-stream",
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}
