import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { createHmac } from "crypto";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

function klingJWT(): string {
  const apiKey = process.env.KLING_API_KEY!;
  const apiSecret = process.env.KLING_API_SECRET!;
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iss: apiKey, exp: now + 1800, nbf: now - 5 })).toString("base64url");
  const sig = createHmac("sha256", apiSecret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${sig}`;
}

async function pollKlingTask(taskId: string): Promise<{ videoUrl: string | null; failed: boolean }> {
  const res = await fetch(`https://api.klingai.com/v1/videos/text2video/${taskId}`, {
    headers: { Authorization: `Bearer ${klingJWT()}` },
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!res || !res.ok) return { videoUrl: null, failed: false };
  const data = await res.json();
  const status = data?.data?.task_status;
  if (status === "succeed") {
    const url = data?.data?.task_result?.videos?.[0]?.url ?? null;
    return { videoUrl: url, failed: !url };
  }
  if (status === "failed") return { videoUrl: null, failed: true };
  return { videoUrl: null, failed: false };
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
    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    if (video.status === "completed" || video.status === "failed") {
      return NextResponse.json({ status: video.status, videoUrl: video.videoUrl });
    }

    const job = await readQueueJob(videoId);
    if (!job) return NextResponse.json({ status: video.status, videoUrl: null });

    const { data, blob } = job;

    if (data.retries > 60) {
      await store.updateVideo(videoId, { status: "failed" });
      await del(blob.url, { token: TOKEN });
      return NextResponse.json({ status: "failed", videoUrl: null });
    }

    // Kling AI path — just poll the task, no throttle needed
    if (data.engine === "kling" && data.klingTaskId) {
      const { videoUrl, failed } = await pollKlingTask(data.klingTaskId);
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
      // Update retry counter so we know we're actively polling
      await put(blob.pathname, JSON.stringify({ ...data, retries: data.retries + 1, lastPolled: new Date().toISOString() }), {
        access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN,
      });
      return NextResponse.json({ status: "processing", videoUrl: null, retries: data.retries + 1, engine: "kling" });
    }

    // HuggingFace fallback path — throttle to once per 50s
    const lastTried = data.lastTried ? Date.now() - new Date(data.lastTried).getTime() : 99999;
    if (lastTried < 50000) {
      return NextResponse.json({ status: "processing", videoUrl: null, retries: data.retries, engine: "hf" });
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
      return NextResponse.json({ status: "processing", videoUrl: null, retries: data.retries + 1, engine: "hf" });
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
