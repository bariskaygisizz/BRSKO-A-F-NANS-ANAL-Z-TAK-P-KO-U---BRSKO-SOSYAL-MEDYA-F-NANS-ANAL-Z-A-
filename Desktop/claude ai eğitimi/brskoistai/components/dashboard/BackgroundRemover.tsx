"use client";
import { useState, useRef } from "react";
import { Upload, Loader2, Download, AlertCircle, Scissors } from "lucide-react";

type Status = "idle" | "uploading" | "processing" | "done" | "error";

export default function BackgroundRemover() {
  const [original, setOriginal] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setOriginal(URL.createObjectURL(file));
    setResult("");
    setStatus("idle");
    setError("");
  }

  async function handleRemove() {
    if (!original) return;
    setStatus("uploading");
    setError("");

    try {
      // Upload to tmpfiles first to get a public URL
      let imageUrl = original;
      if (original.startsWith("blob:") && fileRef.current?.files?.[0]) {
        const form = new FormData();
        form.append("file", fileRef.current.files[0]);
        const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
        const ud = await up.json();
        imageUrl = (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
      }

      setStatus("processing");
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hata oluştu");

      setResult(data.resultUrl);
      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Arka plan silinemedi");
    }
  }

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <Scissors size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Arka Plan Sil</h2>
          <p className="text-xs text-zinc-400">AI ile anında arka plan kaldır</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Görsel Seç</label>
            <div onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${preview ? "border-cyan-500/50 h-48" : "border-white/10 hover:border-cyan-500/30 h-36 flex items-center justify-center"}`}>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Original" className="w-full h-full object-contain bg-zinc-900" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <Upload size={20} />
                  <span className="text-sm">Tıkla veya sürükle</span>
                  <span className="text-xs">PNG, JPG, WEBP</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <button onClick={handleRemove} disabled={isProcessing || !original}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin" />
                {status === "uploading" ? "Yükleniyor..." : "AI işliyor..."}
              </>
            ) : (
              <><Scissors size={16} />Arka Planı Sil</>
            )}
          </button>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={14} className="shrink-0" />{error}
            </div>
          )}

          <div className="glass rounded-xl p-3 text-xs text-zinc-500">
            <span className="text-cyan-400 font-medium">Model:</span> BRIA RMBG-1.4 · Ücretsiz · PNG çıktı
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 glass rounded-xl p-4 min-h-48 flex flex-col items-center justify-center">
            {status === "done" && result ? (
              <div className="w-full flex flex-col gap-4">
                <p className="text-green-400 text-sm font-medium text-center">✓ Arka plan silindi!</p>
                <div className="rounded-lg overflow-hidden" style={{ background: "repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 20px 20px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result} alt="Result" className="w-full max-h-64 object-contain" />
                </div>
                <a href={result} download="nobg.png" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-sm py-2 rounded-lg transition-all">
                  <Download size={14} />PNG İndir (Şeffaf)
                </a>
              </div>
            ) : status === "processing" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 size={32} className="animate-spin text-cyan-400" />
                <p className="text-sm">Arka plan kaldırılıyor...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-zinc-600">
                <div className="text-3xl">✂️</div>
                <p className="text-sm">Sonuç burada görünecek</p>
                <p className="text-xs text-zinc-700">Şeffaf PNG olarak indirilir</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
