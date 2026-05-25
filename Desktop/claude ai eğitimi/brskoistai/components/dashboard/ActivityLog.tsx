"use client";
import { Video } from "@/lib/store";
import { CheckCircle2, Clock, XCircle, Film } from "lucide-react";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

const statusIcon = {
  completed: <CheckCircle2 size={14} className="text-green-400 shrink-0" />,
  processing: <Clock size={14} className="text-yellow-400 shrink-0 animate-pulse" />,
  failed: <XCircle size={14} className="text-red-400 shrink-0" />,
  pending: <Clock size={14} className="text-zinc-500 shrink-0" />,
};

const statusLabel = {
  completed: "Tamamlandı",
  processing: "Üretiliyor",
  failed: "Başarısız",
  pending: "Bekliyor",
};

export default function ActivityLog({ videos }: { videos: Video[] }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Film size={16} className="text-purple-400" />
        <h3 className="font-semibold text-sm">Son İşlemler</h3>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-8 text-zinc-600 text-sm">
          <p>Henüz işlem yok</p>
          <p className="text-xs mt-1">Video üretince burada görünür</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {videos.slice(0, 8).map((v) => (
            <div key={v.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-all">
              {statusIcon[v.status as keyof typeof statusIcon] ?? statusIcon.pending}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-zinc-200">{v.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {statusLabel[v.status as keyof typeof statusLabel] ?? v.status} · {timeAgo(v.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
