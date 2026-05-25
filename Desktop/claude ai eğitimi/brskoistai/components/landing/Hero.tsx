import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import AvatarScene from "./AvatarScene";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Simulator avatar background */}
      <AvatarScene />

      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-purple-300 mb-8">
          <Sparkles size={14} />
          <span>Sora 2 ile güçlendirildi — Dünyanın en iyi video AI'ı</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
          Ürün Görselinizi
          <br />
          <span className="gradient-text">Viral UGC Videosuna</span>
          <br />
          Dönüştürün
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Sadece ürün görseli yükleyin, tanıtım metni yazın. Yapay zeka 
          saniyeler içinde 12 saniyelik profesyonel UGC videosu oluşturup 
          TikTok, Instagram ve YouTube&apos;a yayınlasın.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="group flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 animate-pulse-glow"
          >
            Ücretsiz Başla
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 glass hover:bg-white/10 text-white font-medium px-8 py-4 rounded-full text-lg transition-all"
          >
            <Play size={16} className="fill-white" />
            Nasıl Çalışır
          </a>
        </div>

        <p className="mt-6 text-sm text-zinc-500">Kredi kartı gerekmez · Sınırsız ücretsiz</p>

        {/* Demo card */}
        <div className="mt-16 relative max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-1 shadow-2xl shadow-purple-500/10">
            <div className="bg-zinc-900 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-zinc-500 font-mono">brskoistai.com/dashboard</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-1 glass rounded-xl p-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-purple-500/30 min-h-32">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <span className="text-xs text-zinc-400 text-center">Ürün görselini yükle</span>
                </div>
                <div className="col-span-1 flex flex-col gap-3 justify-center">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                  <div className="h-2 bg-zinc-700 rounded-full w-3/4" />
                  <div className="h-2 bg-zinc-700 rounded-full w-1/2" />
                  <div className="mt-2 text-xs text-zinc-500 text-center">AI işliyor...</div>
                </div>
                <div className="col-span-1 glass rounded-xl overflow-hidden relative min-h-32 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-pink-900/40" />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Play size={16} className="fill-white text-white ml-0.5" />
                    </div>
                    <span className="text-xs text-zinc-300">Video hazır!</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {["TikTok", "Instagram", "YouTube", "Facebook", "LinkedIn", "X"].map((p) => (
                  <span key={p} className="text-xs glass px-3 py-1 rounded-full text-zinc-300">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
