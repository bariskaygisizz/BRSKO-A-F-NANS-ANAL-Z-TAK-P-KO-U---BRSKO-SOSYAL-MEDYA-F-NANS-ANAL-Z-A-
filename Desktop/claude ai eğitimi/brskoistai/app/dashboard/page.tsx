import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import VideoGenerator from "@/components/dashboard/VideoGenerator";
import VideoHistory from "@/components/dashboard/VideoHistory";
import ActivityLog from "@/components/dashboard/ActivityLog";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, videos] = await Promise.all([
    store.getUserByEmail(session.user.email!),
    store.getUserVideos(session.user.id),
  ]);

  const firstName = user?.name?.split(" ")[0] || "Kullanıcı";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">
          Merhaba, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="text-zinc-400 text-sm mt-1">UGC videonuzu üretmeye hazır mısınız?</p>
      </div>

      <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-purple-500/20">
        <span className="text-xl">🎬</span>
        <div>
          <span className="text-sm font-medium text-purple-300">Sınırsız Ücretsiz</span>
          <p className="text-xs text-zinc-400 mt-0.5">Tüm özellikler açık · HuggingFace AI</p>
        </div>
        <span className="ml-auto text-xs glass px-3 py-1 rounded-full text-green-400">✓ Aktif</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <VideoGenerator userId={session.user.id} />
        </div>
        <div>
          <ActivityLog videos={videos} />
        </div>
      </div>

      <VideoHistory videos={videos} />
    </div>
  );
}
