"use client";
import { useState } from "react";
import { Sparkles, Download, Loader2, Image, Copy, CheckCircle2 } from "lucide-react";

export default function StockVideo() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const suggestions = ["parfüm şişesi beyaz arka plan", "spor ayakkabı stüdyo çekimi", "organik cilt bakımı ürünü", "akıllı saat teknoloji ürünü", "kahve çekirdeği ürün fotoğrafı"];

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImages([]);
    try {
      const res = await fetch("/api/quick-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `professional product photography, ${prompt}, studio lighting, white background, commercial ad quality` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hata oluştu");
      setImages(data.images || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
          <Image size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Hızlı Ürün Görseli</h2>
          <p className="text-xs text-zinc-400">fal.ai FLUX · 4 görsel · ~5 saniye</p>
        </div>
        <span className="ml-auto text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">Hızlı</span>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
          placeholder="Ürününüzü tanımlayın: parfüm, spor ayakkabı, cilt bakımı..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
        />
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => setPrompt(s)}
              className="text-xs bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-3 py-1.5 rounded-full transition-all border border-white/10">
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" />Üretiliyor (~5 sn)...</>
            : <><Sparkles size={16} />4 Ürün Görseli Üret</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((url, i) => (
            <div key={i} className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Görsel ${i + 1}`} className="w-full aspect-[3/4] object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <a href={url} download={`product-${i + 1}.jpg`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded-lg transition-all">
                  <Download size={12} />İndir
                </a>
                <button onClick={() => copyUrl(url)}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-2 rounded-lg transition-all">
                  {copied === url ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                  {copied === url ? "Kopyalandı" : "URL"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-zinc-600">
          <div className="text-4xl">🖼️</div>
          <p className="text-sm text-center">Ürününüzü tanımlayın, 4 profesyonel ürün fotoğrafı üretsin</p>
        </div>
      )}
    </div>
  );
}
