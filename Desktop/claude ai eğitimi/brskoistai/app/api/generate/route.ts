import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

async function uploadToTmp(buf: ArrayBuffer, mime: string, name: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime }), name);
  const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
  const ud = await up.json();
  return (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
}

async function generateImage(prompt: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json", "x-wait-for-model": "true" },
      body: JSON.stringify({ inputs: prompt.slice(0, 300) }),
      signal: AbortSignal.timeout(50000),
    });
    if (res.status === 503) { await new Promise(r => setTimeout(r, 10000)); continue; }
    if (!res.ok) throw new Error(`HF ${res.status}`);
    const buf = await res.arrayBuffer();
    return uploadToTmp(buf, "image/jpeg", "ugc.jpg");
  }
  throw new Error("Görsel üretimi başarısız");
}

async function buildPrompt(text: string, type: string, withAvatar: boolean) {
  const avatarHint = withAvatar ? " Include a UGC creator person holding the product." : "";
  if (groq) {
    try {
      const sysMsg = type === "image"
        ? "Write a short English product ad image prompt (max 200 chars). Return JSON: {prompt: string, hashtags: string[]}"
        : "Write a short English cinematic video prompt (max 150 chars) for UGC. Return JSON: {prompt: string, hashtags: string[]}";
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: sysMsg }, { role: "user", content: text + avatarHint }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      return JSON.parse(res.choices[0].message.content || "{}");
    } catch { /**/ }
  }
  return { prompt: (text + avatarHint).slice(0, 200), hashtags: [] };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

    const { imageUrl, promotionText, type = "video", withAvatar = false } = await req.json();
    if (!promotionText) return NextResponse.json({ error: "Tanıtım metni gerekli" }, { status: 400 });

    const { prompt, hashtags } = await buildPrompt(promotionText, type, withAvatar);

    const video = await store.createVideo({
      userId: session.user.id,
      title: promotionText.slice(0, 60),
      prompt,
      imageUrl: imageUrl || null,
      type,
    });

    if (type === "image") {
      // Images are fast enough to generate inline
      generateImage(prompt).then(videoUrl =>
        store.updateVideo(video.id, { status: "completed", videoUrl })
      ).catch(() =>
        store.updateVideo(video.id, { status: "failed" })
      );
    } else {
      // Videos go into the cron queue
      await put(`queue/${video.id}.json`, JSON.stringify({
        videoId: video.id, prompt, retries: 0, type, createdAt: new Date().toISOString(),
      }), { access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN });
    }

    return NextResponse.json({ success: true, videoId: video.id, hashtags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
