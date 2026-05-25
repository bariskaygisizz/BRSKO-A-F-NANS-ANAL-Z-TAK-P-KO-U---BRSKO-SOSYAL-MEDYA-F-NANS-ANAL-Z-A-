"use client";
import { Zap, Crown, ArrowUpRight } from "lucide-react";

interface Props {
  plan: string;
  credits: number;
}

export default function PlanBanner({ plan, credits }: Props) {
  async function handleUpgrade(selectedPlan: string) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  if (plan === "pro") {
    return (
      <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-yellow-500/20">
        <Crown size={18} className="text-yellow-400 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium text-yellow-400">Pro Plan</span>
          <span className="text-xs text-zinc-400 ml-2">· Sınırsız video kredisi</span>
        </div>
      </div>
    );
  }

  if (plan === "starter") {
    return (
      <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-purple-500/20">
        <Zap size={18} className="text-purple-400 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium text-purple-400">Starter Plan</span>
          <span className="text-xs text-zinc-400 ml-2">· {credits} kredi kaldı</span>
        </div>
        <button
          onClick={() => handleUpgrade("pro")}
          className="flex items-center gap-1 text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full transition-all"
        >
          Pro&apos;ya Geç <ArrowUpRight size={12} />
        </button>
      </div>
    );
  }

  // Free plan
  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-purple-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">Ücretsiz Plan</span>
            <span className="text-xs text-zinc-400">·</span>
            <span className={`text-xs font-medium ${credits <= 1 ? "text-red-400" : "text-zinc-300"}`}>
              {credits} kredi kaldı
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.max(0, (credits / 3) * 100)}%` }}
            />
          </div>
          {credits === 0 && (
            <p className="text-xs text-red-400 mt-1">Krediniz bitti. Devam etmek için plan seçin.</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleUpgrade("starter")}
            className="flex items-center gap-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-2 rounded-full transition-all"
          >
            Starter — ₺299/ay
          </button>
          <button
            onClick={() => handleUpgrade("pro")}
            className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-full transition-all"
          >
            Pro — ₺799/ay <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
