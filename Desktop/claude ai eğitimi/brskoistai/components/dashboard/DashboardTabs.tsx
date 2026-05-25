"use client";
import { useState } from "react";
import { Film, Scissors, Clock } from "lucide-react";
import ContentGenerator from "./ContentGenerator";
import BackgroundRemover from "./BackgroundRemover";
import VideoHistory from "./VideoHistory";
import ActivityLog from "./ActivityLog";
import type { Video } from "@/lib/store";

const tabs = [
  { id: "create", label: "İçerik Üret", icon: Film },
  { id: "rembg", label: "Arka Plan Sil", icon: Scissors },
  { id: "history", label: "Geçmiş", icon: Clock },
] as const;

type Tab = typeof tabs[number]["id"];

export default function DashboardTabs({ userId, videos }: { userId: string; videos: Video[] }) {
  const [active, setActive] = useState<Tab>("create");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab nav */}
      <div className="flex gap-1 glass p-1 rounded-2xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active === id ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-400 hover:text-white"}`}>
            <Icon size={14} />
            {label}
            {id === "history" && videos.length > 0 && (
              <span className="ml-0.5 bg-purple-500/30 text-purple-300 text-xs px-1.5 py-0.5 rounded-full">{videos.length}</span>
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
      {active === "rembg" && <BackgroundRemover />}
      {active === "history" && <VideoHistory videos={videos} />}
    </div>
  );
}
