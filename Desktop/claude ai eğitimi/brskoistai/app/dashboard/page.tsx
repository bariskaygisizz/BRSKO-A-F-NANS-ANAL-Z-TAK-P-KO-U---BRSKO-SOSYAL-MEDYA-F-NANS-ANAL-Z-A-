import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, videos, limits] = await Promise.all([
    store.getUserByEmail(session.user.email!),
    store.getUserVideos(session.user.id),
    store.getAiLimit(session.user.email!),
  ]);

  const firstName = user?.name?.split(" ")[0] || "Kullanıcı";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">
          Merhaba, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="text-zinc-400 text-sm mt-1">AI içerik üretmeye hazır mısınız?</p>
      </div>

      <DashboardTabs
        userId={session.user.id}
        videos={videos}
        aiUsed={limits.used}
        aiLimit={limits.limit}
      />
    </div>
  );
}
