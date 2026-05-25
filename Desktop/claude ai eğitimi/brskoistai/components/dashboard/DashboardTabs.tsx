"use client";
import { useState } from "react";
import { Film, Scissors, Clock, Library } from "lucide-react";
import ContentGenerator from "./ContentGenerator";
import BackgroundRemover from "./BackgroundRemover";
import VideoHistory from "./VideoHistory";
import ActivityLog from "./ActivityLog";
import StockVideo from "./StockVideo";
import type { Video } from "@/lib/store";

const tabs = [
  { id: "create",  label: "AI Üret",    icon: Film },
  { id: "stock",   label: "Hızlı Görsel", icon: Library },
  { id: "rembg",   label: "Arka Plan Sil", icon: Scissors },
  { id: "history", label: "Geçmiş",     icon: Clock },
] as const;

type Tab = typeof tabs[number]["id"];

interface Props {
  userId: string;
  videos: Video[];
  aiUsed: number;
  aiLimit: number;
}

export default function DashboardTabs({ userId, videos, aiUsed, aiLimit }: Props) {
  const [active, setActive] = useState<Tab>("create");

  const remaining = Math.max(0, aiLimit - aiUsed);
  const pct = Math.min(100, (aiUsed / aiLimit) * 100);
  const limitColor = remaining === 0 ? "text-red-400" : remaining <= 3 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="flex flex-col gap-6">
      {/* Limit bar */}
      <div className="glass rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Aylık AI Üretim Hakkı</span>
          <span className={`font-bold ${limitColor}`}>{remaining}/{aiLimit} kaldı</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${remaining === 0 ? "bg-red-500" : remaining <= 3 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${100 - pct}%` }}
          />
        </div>
        {remaining === 0 && (
          <p className="text-xs text-red-400">Limitiniz doldu. Önümüzdeki ay sıfırlanır.</p>
        )}
        {remaining > 0 && remaining <= 3 && (
          <p className="text-xs text-yellow-400">Az kaldı! Stok videolardan da yararlanabilirsiniz.</p>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 glass p-1 rounded-2xl w-fit flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active === id ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-400 hover:text-white"}`}>
            <Icon size={14} />
            {label}
            {id === "history" && videos.length > 0 && (
              <span className="ml-0.5 bg-purple-500/30 text-purple-300 text-xs px-1.5 py-0.5 rounded-full">{videos.length}</span>
            )}
            {id === "stock" && (
              <span className="ml-0.5 bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded-full">∞</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "create" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ContentGenerator userId={userId} />
          </div>
          <div>
            <ActivityLog videos={videos} />
          </div>
        </div>
      )}
      {active === "stock" && <StockVideo />}
      {active === "rembg" && <BackgroundRemover />}
      {active === "history" && <VideoHistory videos={videos} />}
    </div>
  );
}
