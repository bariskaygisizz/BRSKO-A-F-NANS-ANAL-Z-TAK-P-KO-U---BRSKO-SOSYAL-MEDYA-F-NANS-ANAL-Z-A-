import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "product advertisement";

  const PEXELS_KEY = process.env.PEXELS_API_KEY;
  if (!PEXELS_KEY) {
    return NextResponse.json({ error: "Pexels API key yok", videos: [] });
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=6&orientation=portrait&size=medium`,
      { headers: { Authorization: PEXELS_KEY }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return NextResponse.json({ videos: [] });
    const data = await res.json();

    const videos = (data.videos || []).map((v: any) => {
      const file = v.video_files?.find((f: any) => f.quality === "hd") ?? v.video_files?.[0];
      return {
        id: v.id,
        url: file?.link ?? "",
        thumb: v.image,
        duration: v.duration,
        width: v.width,
        height: v.height,
        photographer: v.user?.name ?? "",
      };
    }).filter((v: any) => v.url);

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
