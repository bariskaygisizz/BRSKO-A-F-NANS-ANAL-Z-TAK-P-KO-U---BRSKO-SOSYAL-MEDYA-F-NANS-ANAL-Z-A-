import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    if (!videoId) return NextResponse.json({ error: "videoId gerekli" }, { status: 400 });

    const video = await prisma.video.findFirst({
      where: { id: videoId, userId: session.user.id },
      select: { status: true, videoUrl: true },
    });

    if (!video) return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });

    return NextResponse.json({
      status: video.status,
      videoUrl: video.videoUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
