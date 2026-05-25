import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { store } from "@/lib/store";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function uploadToTmp(buf: ArrayBuffer, mime: string, name: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime }), name);
  const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
  const ud = await up.json();
  return (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
}

async function tryHuggingFace(prompt: string): Promise<ArrayBuffer | null> {
  const res = await fetch("https://api-inference.huggingface.co/models/cerspense/zeroscope_v2_576w", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/json",
      "x-wait-for-model": "true",
    },
    body: JSON.stringify({ inputs: prompt.slice(0, 200) }),
    signal: AbortSignal.timeout(50000),
  });
  if (res.status === 503) return null; // model loading, retry next minute
  if (!res.ok) throw new Error(`HF ${res.status}`);
  return res.arrayBuffer();
}

export async function GET(req: Request) {
  // Verify it's Vercel cron
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: "queue/", limit: 3, token: TOKEN });
    if (!blobs.length) return NextResponse.json({ processed: 0 });

    let processed = 0;
    for (const blob of blobs) {
      try {
        const res = await fetch(blob.url, { headers: { Authorization: `Bearer ${TOKEN}` } });
        if (!res.ok) continue;
        const job = await res.json() as { videoId: string; prompt: string; retries: number; type: string };

        if (job.retries > 25) {
          await store.updateVideo(job.videoId, { status: "failed" });
          await del(blob.url, { token: TOKEN });
          continue;
        }

        // Update retry count
        await put(blob.pathname, JSON.stringify({ ...job, retries: job.retries + 1 }), {
          access: "private", addRandomSuffix: false, token: TOKEN,
        });

        const buf = await tryHuggingFace(job.prompt);
        if (!buf) continue; // model loading, try next minute

        const videoUrl = await uploadToTmp(buf, "video/mp4", "ugc.mp4");
        await store.updateVideo(job.videoId, { status: "completed", videoUrl });
        await del(blob.url, { token: TOKEN });
        processed++;
      } catch {
        // leave in queue, try next minute
      }
    }

    return NextResponse.json({ processed, queued: blobs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
