import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const INSTAGRAM_URL_RE = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?/;

export default function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const isValid = url.trim().length === 0 || INSTAGRAM_URL_RE.test(url.trim());

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) return;
    if (!INSTAGRAM_URL_RE.test(trimmed)) {
      setStatus("error");
      setError("That doesn't look like a valid Instagram post, reel, or tv link.");
      return;
    }

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Failed to process this link.");
    }
  }

  function handleReset() {
    setUrl("");
    setStatus("idle");
    setError("");
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-insta-purple via-insta-pink to-insta-orange flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-1">
          Reel & Media Downloader
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Paste a link to a public Instagram post, reel, or video
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className={`flex-1 px-4 py-3 rounded-xl border outline-none transition
              ${isValid ? "border-gray-300 focus:border-insta-pink" : "border-red-400 focus:border-red-500"}
            `}
          />
          <button
            type="submit"
            disabled={status === "loading" || !url.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-insta-purple to-insta-pink text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {status === "loading" ? "Fetching..." : "Get Media"}
          </button>
        </form>

        {!isValid && (
          <p className="text-red-500 text-sm mt-2">Enter a valid instagram.com link.</p>
        )}

        {status === "loading" && (
          <div className="mt-6 flex flex-col items-center gap-2 text-gray-500">
            <div className="w-8 h-8 border-4 border-insta-pink border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Extracting media, this can take a few seconds...</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {status === "success" && result && (
          <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt="preview"
                className="w-full max-h-80 object-cover"
              />
            )}
            <div className="p-4">
              {result.title && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{result.title}</p>
              )}
              <div className="flex gap-2">
                <a
                  href={`${API_BASE}${result.download_url}`}
                  download
                  className="flex-1 text-center px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Download {result.media_type === "video" ? "Video" : "Image"}
                </a>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  New
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Only use this on public content you have the right to download and reuse.
        </p>
      </div>
    </div>
  );
      }
