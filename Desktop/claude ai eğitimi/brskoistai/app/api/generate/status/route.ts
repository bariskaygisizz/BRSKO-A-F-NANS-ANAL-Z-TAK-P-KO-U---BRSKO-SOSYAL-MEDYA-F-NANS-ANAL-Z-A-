import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function pollFal(requestId: string, model: string): Promise<{ videoUrl: string | null; failed: boolean }> {
  const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${process.env.FAL_API_KEY}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!statusRes || !statusRes.ok) return { videoUrl: null, failed: false };
  const s = await statusRes.json();
  if (s.status === "FAILED") return { videoUrl: null, failed: true };
  if (s.status !== "COMPLETED") return { videoUrl: null, failed: false };
  const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
    headers: { Authorization: `Key ${process.env.FAL_API_KEY}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!resultRes || !resultRes.ok) return { videoUrl: null, failed: false };
  const r = await resultRes.json();
  const url = r?.video?.url ?? r?.video_url ?? r?.output?.[0]?.url ?? null;
  return { videoUrl: url, failed: false };
}

async function uploadToTmp(buf: ArrayBuffer): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: "video/mp4" }), "ugc.mp4");
  const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
  const ud = await up.json();
  return (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
}

async function readQueueJob(videoId: string) {
  const { blobs } = await list({ prefix: `queue/${videoId}.json`, limit: 1, token: TOKEN });
  if (!blobs.length) return null;
  const res = await fetch(blobs[0].url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return res.ok ? { blob: blobs[0], data: await res.json() } : null;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    if (!videoId) return NextResponse.json({ error: "videoId gerekli" }, { status: 400 });

    const video = await store.getVideo(videoId);
    if (!video || video.userId !== session.user.id) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

    if (video.status === "completed" || video.status === "failed") {
      return NextResponse.json({ status: video.status, videoUrl: video.videoUrl });
    }

    const job = await readQueueJob(videoId);
    if (!job) return NextResponse.json({ status: video.status, videoUrl: null });

    const { data, blob } = job;

    if (data.retries > 50) {
      await store.updateVideo(videoId, { status: "failed" });
      await del(blob.url, { token: TOKEN });
      return NextResponse.json({ status: "failed", videoUrl: null });
    }

    // fal.ai path
    if (data.engine === "fal" && data.falRequestId && data.falModel) {
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
      await put(blob.pathname, JSON.stringify({ ...data, retries: data.retries + 1 }), {
        access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN,
      });
      return NextResponse.json({ status: "processing", videoUrl: null, engine: "fal" });
    }

    // HuggingFace path — throttle to once per 50s
    const lastTried = data.lastTried ? Date.now() - new Date(data.lastTried).getTime() : 99999;
    if (lastTried < 50000) {
      return NextResponse.json({ status: "processing", videoUrl: null, engine: "hf" });
    }

    await put(blob.pathname, JSON.stringify({ ...data, retries: data.retries + 1, lastTried: new Date().toISOString() }), {
      access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN,
    });

    const hfRes = await fetch("https://api-inference.huggingface.co/models/cerspense/zeroscope_v2_576w", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json", "x-wait-for-model": "true" },
      body: JSON.stringify({ inputs: data.prompt.slice(0, 200) }),
      signal: AbortSignal.timeout(50000),
    }).catch(() => null);

    if (!hfRes || hfRes.status === 503 || !hfRes.ok) {
      return NextResponse.json({ status: "processing", videoUrl: null, engine: "hf" });
    }

    const buf = await hfRes.arrayBuffer();
    const videoUrl = await uploadToTmp(buf);
    await store.updateVideo(videoId, { status: "completed", videoUrl });
    await del(blob.url, { token: TOKEN });
    return NextResponse.json({ status: "completed", videoUrl });
  } catch {
    return NextResponse.json({ status: "processing", videoUrl: null });
  }
}
