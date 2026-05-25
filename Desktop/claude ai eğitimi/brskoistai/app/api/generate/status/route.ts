import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

interface QueueJob {
  videoId: string;
  prompt: string;
  retries: number;
  falRequestId?: string;
  falModel?: string;
  createdAt: string;
}

async function pollFal(requestId: string, model: string): Promise<{ videoUrl: string | null; failed: boolean }> {
  // Check status
  const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${process.env.FAL_API_KEY}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!statusRes || !statusRes.ok) return { videoUrl: null, failed: false };
  const statusData = await statusRes.json();

  if (statusData.status === "FAILED") return { videoUrl: null, failed: true };
  if (statusData.status !== "COMPLETED") return { videoUrl: null, failed: false };

  // Get result
  const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
    headers: { Authorization: `Key ${process.env.FAL_API_KEY}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!resultRes || !resultRes.ok) return { videoUrl: null, failed: false };
  const result = await resultRes.json();

  // fal.ai models return video in different shapes
  const url = result?.video?.url ?? result?.video_url ?? result?.output?.[0]?.url ?? null;
  return { videoUrl: url, failed: false };
}

async function readQueueJob(videoId: string) {
  const { blobs } = await list({ prefix: `queue/${videoId}.json`, limit: 1, token: TOKEN });
  if (!blobs.length) return null;
  const res = await fetch(blobs[0].url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return res.ok ? { blob: blobs[0], data: (await res.json()) as QueueJob } : null;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    if (!videoId) return NextResponse.json({ error: "videoId gerekli" }, { status: 400 });

    const video = await store.getVideo(videoId);
    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    if (video.status === "completed" || video.status === "failed") {
      return NextResponse.json({ status: video.status, videoUrl: video.videoUrl });
    }

    const job = await readQueueJob(videoId);
    if (!job) {
      return NextResponse.json({ status: video.status, videoUrl: null });
    }

    const { data, blob } = job;

    // Too many retries — give up
    if (data.retries > 40) {
      await store.updateVideo(videoId, { status: "failed" });
      await del(blob.url, { token: TOKEN });
      return NextResponse.json({ status: "failed", videoUrl: null });
    }

    // fal.ai poll (model name comes from the stored job — always correct)
    if (data.falRequestId && data.falModel) {
      const { videoUrl, failed } = await pollFal(data.falRequestId, data.falModel);

      if (failed) {
        await store.updateVideo(videoId, { status: "failed" });
        await del(blob.url, { token: TOKEN });
        return NextResponse.json({ status: "failed", videoUrl: null });
      }

      if (videoUrl) {
        await store.updateVideo(videoId, { status: "completed", videoUrl });
        await del(blob.url, { token: TOKEN });
        return NextResponse.json({ status: "completed", videoUrl });
      }

      // Still processing — increment retry count
      await put(blob.pathname, JSON.stringify({ ...data, retries: data.retries + 1 }), {
        access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN,
      });
      return NextResponse.json({
        status: "processing",
        videoUrl: null,
        retries: data.retries + 1,
        engine: "fal",
        model: data.falModel,
      });
    }

    return NextResponse.json({ status: "failed", videoUrl: null });
  } catch {
    return NextResponse.json({ status: "processing", videoUrl: null });
  }
}
