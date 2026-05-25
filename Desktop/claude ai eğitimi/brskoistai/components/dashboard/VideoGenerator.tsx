"use client";
import { useState, useRef } from "react";
import { Upload, Sparkles, Loader2, CheckCircle2, AlertCircle, Download, Copy } from "lucide-react";

interface Props {
  userId: string;
  
}

type GenStatus = "idle" | "uploading" | "generating" | "polling" | "done" | "error";

export default function VideoGenerator({ userId }: Props) {
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [promotionText, setPromotionText] = useState("");
  const [status, setStatus] = useState<GenStatus>("idle");
  const [videoUrl, setVideoUrl] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setImageUrl(URL.createObjectURL(file));
  }

  async function uploadToTmpfiles(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
    const data = await res.json();
    const raw: string = data?.data?.url || "";
    return raw.replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
  }

  async function handleGenerate() {
    if (!promotionText.trim()) return;

    setStatus("uploading");
    setError("");
    setVideoUrl("");
    setHashtags([]);

    try {
      let finalImageUrl = imageUrl;
      if (imageUrl.startsWith("blob:") && fileRef.current?.files?.[0]) {
        finalImageUrl = await uploadToTmpfiles(fileRef.current.files[0]);
      }

      setStatus("generating");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: finalImageUrl || null, promotionText }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Üretim başlatılamadı");

      setHashtags(genData.hashtags || []);
      setStatus("polling");

      // Poll DB for completion
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 60) {
          clearInterval(pollRef.current!);
          setStatus("error");
          setError("Zaman aşımı. Lütfen video geçmişini kontrol edin.");
          return;
        }
        const res = await fetch(`/api/generate/status?videoId=${genData.videoId}`);
        const data = await res.json();
        if (data.status === "completed" && data.videoUrl) {
          clearInterval(pollRef.current!);
          setVideoUrl(data.videoUrl);
          setStatus("done");
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setStatus("error");
          setError("Video üretimi başarısız oldu.");
        }
      }, 15000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Bir hata oluştu");
    }
  }

  const isProcessing = status === "uploading" || status === "generating" || status === "polling";
  const statusMsg: Record<string, string> = {
    uploading: "Görsel yükleniyor...",
    generating: "AI prompt hazırlıyor...",
    polling: "Video üretiliyor... (5-10 dakika, HuggingFace ücretsiz)",
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Video Üret</h2>
          <p className="text-xs text-zinc-400">HuggingFace ile ücretsiz UGC video</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Ürün Görseli (isteğe bağlı)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${
                imagePreview ? "border-purple-500/50 h-40" : "border-white/10 hover:border-purple-500/30 h-28 flex items-center justify-center"
              }`}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <Upload size={20} />
                  <span className="text-sm">Tıkla veya sürükle</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-1.5 block">Tanıtım Metni *</label>
            <textarea rows={4} placeholder="Ürününüzü tanıtın: özellikler, hedef kitle, kampanya mesajı..."
              value={promotionText} onChange={(e) => setPromotionText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-600 resize-none" />
          </div>

          <button onClick={handleGenerate}
            disabled={isProcessing || !promotionText.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin" />{statusMsg[status]}</>
            ) : (
              <><Sparkles size={16} />Video Üret (Ücretsiz Sınırsız)</>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={14} className="shrink-0" />{error}
            </div>
          )}

          <div className="glass rounded-xl p-3 text-xs text-zinc-500">
            <span className="text-yellow-400 font-medium">Not:</span> HuggingFace ücretsiz tier yavaş olabilir.
            Model yükleniyorsa 5-10 dakika bekleyin. Sayfayı kapatmayın.
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 glass rounded-xl p-4 min-h-48 flex flex-col items-center justify-center">
            {status === "done" && videoUrl ? (
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle2 size={16} />Video hazır!
                </div>
                <video src={videoUrl} controls className="w-full rounded-lg max-h-64 object-contain bg-black" />
                <div className="flex gap-2">
                  <a href={videoUrl} download="ugc-video.mp4" target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm py-2 rounded-lg transition-all">
                    <Download size={14} />İndir
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(videoUrl)}
                    className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-all">
                    <Copy size={14} />URL
                  </button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((h, i) => (
                      <span key={i} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full">
                        #{h.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : status === "polling" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 size={32} className="animate-spin text-purple-400" />
                <div>
                  <p className="text-sm font-medium">HuggingFace video üretiyor</p>
                  <p className="text-xs text-zinc-500 mt-1">Ücretsiz model yükleniyorsa 5-10 dk sürebilir</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-zinc-600">
                <div className="text-3xl">🎬</div>
                <p className="text-sm">Video burada görünecek</p>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-4">
            <p className="text-xs text-zinc-500 font-medium mb-2">Nasıl çalışır:</p>
            <ol className="text-xs text-zinc-400 flex flex-col gap-1.5">
              <li><span className="text-purple-400">1.</span> Tanıtım metni → AI video prompt yazar</li>
              <li><span className="text-purple-400">2.</span> HuggingFace ücretsiz model çalıştırır</li>
              <li><span className="text-purple-400">3.</span> Video otomatik kaydedilir</li>
              <li><span className="text-purple-400">4.</span> İndir veya paylaş</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
