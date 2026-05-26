"use client";
import { useState, useRef } from "react";
import { Upload, Sparkles, Loader2, CheckCircle2, AlertCircle, Download, Copy, Image, Video, User, UserX } from "lucide-react";

type GenType = "video" | "image";
type GenStatus = "idle" | "uploading" | "generating" | "polling" | "done" | "error";

export default function ContentGenerator({ userId }: { userId: string }) {
  const [genType, setGenType] = useState<GenType>("video");
  const [withAvatar, setWithAvatar] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [promotionText, setPromotionText] = useState("");
  const [status, setStatus] = useState<GenStatus>("idle");
  const [resultUrl, setResultUrl] = useState("");
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
    setResultUrl("");
    setHashtags([]);

    try {
      let finalImageUrl = imageUrl;
      if (imageUrl.startsWith("blob:") && fileRef.current?.files?.[0]) {
        finalImageUrl = await uploadToTmpfiles(fileRef.current.files[0]);
      }

      setStatus("generating");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: finalImageUrl || null, promotionText, type: genType, withAvatar }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) throw new Error("Aylık limitiniz doldu. Stok Video sekmesini deneyin!");
        if (data.retryable) throw new Error("Servis meşgul, 30 saniye sonra tekrar deneyin.");
        throw new Error(data.error || "Üretim başlatılamadı");
      }

      setHashtags(data.hashtags || []);
      setStatus("polling");

      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 120) {
          clearInterval(pollRef.current!);
          setStatus("error");
          setError("Zaman aşımı — lütfen tekrar deneyin.");
          return;
        }
        const s = await fetch(`/api/generate/status?videoId=${data.videoId}`);
        const sd = await s.json();
        if (sd.status === "completed" && sd.videoUrl) {
          clearInterval(pollRef.current!);
          setResultUrl(sd.videoUrl);
          setStatus("done");
        } else if (sd.status === "failed") {
          clearInterval(pollRef.current!);
          setStatus("error");
          setError("Üretim başarısız oldu.");
        }
      }, 5000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Hata oluştu");
    }
  }

  const isProcessing = ["uploading", "generating", "polling"].includes(status);
  const statusMsg: Record<string, string> = {
    uploading: "Görsel yükleniyor...",
    generating: "AI prompt hazırlıyor...",
    polling: genType === "video" ? "Video üretiliyor... (5-15 dk)" : "Görsel üretiliyor... (1-3 dk)",
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      {/* Header + Tabs */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">İçerik Üret</h2>
          <p className="text-xs text-zinc-400">AI ile ücretsiz UGC içerik</p>
        </div>
        {/* Type tabs */}
        <div className="ml-auto flex gap-1 glass p-1 rounded-xl">
          <button onClick={() => setGenType("video")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${genType === "video" ? "bg-purple-500 text-white" : "text-zinc-400 hover:text-white"}`}>
            <Video size={12} />Video
          </button>
          <button onClick={() => setGenType("image")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${genType === "image" ? "bg-purple-500 text-white" : "text-zinc-400 hover:text-white"}`}>
            <Image size={12} />Görsel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {/* Image upload */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Ürün Görseli (isteğe bağlı)</label>
            <div onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${imagePreview ? "border-purple-500/50 h-40" : "border-white/10 hover:border-purple-500/30 h-28 flex items-center justify-center"}`}>
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

          {/* Promotion text */}
          <div>
            <label className="text-sm text-zinc-400 mb-1.5 block">Tanıtım Metni *</label>
            <textarea rows={4} placeholder="Ürününüzü tanıtın: özellikler, hedef kitle, kampanya mesajı..."
              value={promotionText} onChange={(e) => setPromotionText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-600 resize-none" />
          </div>

          {/* Avatar toggle (only for video) */}
          {genType === "video" && (
            <div className="flex gap-2">
              <button onClick={() => setWithAvatar(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${!withAvatar ? "border-purple-500 bg-purple-500/10 text-purple-300" : "border-white/10 text-zinc-500 hover:border-white/20"}`}>
                <UserX size={14} />Avatarsız
              </button>
              <button onClick={() => setWithAvatar(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${withAvatar ? "border-purple-500 bg-purple-500/10 text-purple-300" : "border-white/10 text-zinc-500 hover:border-white/20"}`}>
                <User size={14} />UGC Avatarlı
              </button>
            </div>
          )}

          {/* Generate button */}
          <button onClick={handleGenerate} disabled={isProcessing || !promotionText.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin" />{statusMsg[status]}</>
            ) : (
              <><Sparkles size={16} />{genType === "video" ? "Video" : "Görsel"} Üret (Ücretsiz)</>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={14} className="shrink-0" />{error}
            </div>
          )}
        </div>

        {/* Result panel */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 glass rounded-xl p-4 min-h-48 flex flex-col items-center justify-center">
            {status === "done" && resultUrl ? (
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  {genType === "video" ? "Video hazır!" : "Görsel hazır!"}
                </div>
                {genType === "video" ? (
                  <video src={resultUrl} controls className="w-full rounded-lg max-h-64 object-contain bg-black" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Generated" className="w-full rounded-lg max-h-64 object-contain" />
                )}
                <div className="flex gap-2">
                  <a href={resultUrl} download={`ugc.${genType === "video" ? "mp4" : "jpg"}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm py-2 rounded-lg transition-all">
                    <Download size={14} />İndir
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(resultUrl)}
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
                  <p className="text-sm font-medium">AI {genType === "video" ? "video" : "görsel"} üretiyor</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {genType === "video" ? "5-15 dakika (ücretsiz AI)" : "1-3 dakika sürebilir"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-zinc-600">
                <div className="text-3xl">{genType === "video" ? "🎬" : "🖼️"}</div>
                <p className="text-sm">{genType === "video" ? "Video" : "Görsel"} burada görünecek</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
