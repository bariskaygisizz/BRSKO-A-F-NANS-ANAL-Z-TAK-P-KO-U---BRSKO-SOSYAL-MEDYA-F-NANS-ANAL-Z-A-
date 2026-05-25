"use client";
import { Play, Download, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Video {
  id: string;
  title: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
}

interface Props {
  videos: Video[];
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-green-400" />,
  processing: <Loader2 size={14} className="text-purple-400 animate-spin" />,
  pending: <Clock size={14} className="text-yellow-400" />,
  failed: <XCircle size={14} className="text-red-400" />,
};

const statusLabels: Record<string, string> = {
  completed: "Tamamlandı",
  processing: "İşleniyor",
  pending: "Bekliyor",
  failed: "Başarısız",
};

export default function VideoHistory({ videos }: Props) {
  if (videos.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🎥</div>
        <h3 className="font-medium mb-1">Henüz video yok</h3>
        <p className="text-sm text-zinc-500">İlk UGC videonuzu üretmek için yukarıdaki formu kullanın.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
          <Play size={16} className="text-zinc-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Video Geçmişi</h2>
          <p className="text-xs text-zinc-400">{videos.length} video</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-white/5 transition-all">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
              {video.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{video.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {statusIcons[video.status] || statusIcons.pending}
                <span className="text-xs text-zinc-400">{statusLabels[video.status] || video.status}</span>
                <span className="text-xs text-zinc-600">·</span>
                <span className="text-xs text-zinc-500">
                  {new Date(video.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>

            {video.videoUrl && video.status === "completed" && (
              <div className="flex gap-2 shrink-0">
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs glass hover:bg-white/10 text-zinc-300 px-3 py-1.5 rounded-full transition-all"
                >
                  <Play size={12} className="fill-current" />
                  İzle
                </a>
                <a
                  href={video.videoUrl}
                  download
                  className="flex items-center gap-1 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full transition-all"
                >
                  <Download size={12} />
                  İndir
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
