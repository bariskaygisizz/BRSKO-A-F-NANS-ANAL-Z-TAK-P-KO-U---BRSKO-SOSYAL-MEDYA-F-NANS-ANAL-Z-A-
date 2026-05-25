"use client";
import { useState } from "react";
import { Search, Download, Loader2, Video, ExternalLink } from "lucide-react";

interface StockVideoItem {
  id: number;
  url: string;
  thumb: string;
  duration: number;
  photographer: string;
}

export default function StockVideo() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<StockVideoItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [noKey, setNoKey] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/stock-video?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error === "Pexels API key yok") { setNoKey(true); setVideos([]); }
      else { setVideos(data.videos || []); setNoKey(false); }
    } catch {
      setVideos([]);
    }
    setLoading(false);
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Video size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Stok Video</h2>
          <p className="text-xs text-zinc-400">Pexels · Ücretsiz · Anında · Sınırsız</p>
        </div>
        <span className="ml-auto text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full">∞ Sınırsız</span>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Ürün veya konu ara: parfüm, spor, teknoloji..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl transition-all"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Ara
        </button>
      </div>

      {noKey && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm rounded-xl p-4 mb-4">
          <p className="font-medium mb-1">Pexels API key gerekli</p>
          <p className="text-xs text-yellow-400/70">
            1. <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="underline">pexels.com/api</a> adresinden ücretsiz key al<br />
            2. Vercel Dashboard → Environment Variables → <code>PEXELS_API_KEY</code> ekle<br />
            3. Redeploy yap
          </p>
        </div>
      )}

      {!searched && !noKey && (
        <div className="flex flex-col items-center gap-3 py-12 text-zinc-600">
          <Search size={32} />
          <p className="text-sm">Ürününüzle ilgili bir konu arayın</p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {["parfüm", "spor ayakkabı", "cilt bakımı", "kahve", "teknoloji"].map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); }}
                className="text-xs bg-white/5 hover:bg-white/10 text-zinc-400 px-3 py-1.5 rounded-full transition-all border border-white/10">
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && !loading && videos.length === 0 && !noKey && (
        <p className="text-center text-zinc-500 text-sm py-8">Sonuç bulunamadı, farklı bir arama deneyin.</p>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {videos.map(v => (
            <div key={v.id} className="group relative rounded-xl overflow-hidden bg-black border border-white/5 hover:border-blue-500/30 transition-all">
              <video
                src={v.url}
                poster={v.thumb}
                muted
                loop
                className="w-full aspect-[9/16] object-cover"
                onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                onMouseLeave={e => { const el = e.currentTarget as HTMLVideoElement; el.pause(); el.currentTime = 0; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3 gap-2">
                <p className="text-xs text-zinc-300 truncate">📷 {v.photographer}</p>
                <p className="text-xs text-zinc-400">{v.duration}s</p>
                <div className="flex gap-1">
                  <a href={v.url} download target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 rounded-lg transition-all">
                    <Download size={12} />İndir
                  </a>
                  <a href={v.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1.5 rounded-lg transition-all">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
