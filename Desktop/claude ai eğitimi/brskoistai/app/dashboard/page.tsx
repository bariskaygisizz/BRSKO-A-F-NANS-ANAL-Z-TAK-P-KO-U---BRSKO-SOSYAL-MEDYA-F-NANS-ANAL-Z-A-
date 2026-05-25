import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import VideoGenerator from "@/components/dashboard/VideoGenerator";
import VideoHistory from "@/components/dashboard/VideoHistory";
export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">
          Merhaba, <span className="gradient-text">{user?.name?.split(" ")[0] || "Kullanıcı"}</span> 👋
        </h1>
        <p className="text-zinc-400 text-sm mt-1">UGC videonuzu üretmeye hazır mısınız?</p>
      </div>

      <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-purple-500/20">
        <span className="text-xl">🎬</span>
        <div>
          <span className="text-sm font-medium text-purple-300">Sınırsız Ücretsiz</span>
          <p className="text-xs text-zinc-400 mt-0.5">Tüm özellikler açık · ComfyUI + HuggingFace</p>
        </div>
        <span className="ml-auto text-xs glass px-3 py-1 rounded-full text-green-400">✓ Aktif</span>
      </div>

      <VideoGenerator userId={session.user.id} />
      <VideoHistory videos={videos} />
    </div>
  );
}
