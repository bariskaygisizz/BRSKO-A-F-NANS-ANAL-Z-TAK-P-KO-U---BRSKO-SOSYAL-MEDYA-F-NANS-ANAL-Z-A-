import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createHmac } from "crypto";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
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

async function submitKlingTask(prompt: string): Promise<string | null> {
  const res = await fetch("https://api.klingai.com/v1/videos/text2video", {
    method: "POST",
    headers: { Authorization: `Bearer ${klingJWT()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt.slice(0, 2500), duration: "5", aspect_ratio: "9:16" }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data?.task_id ?? null;
}

async function callOpenRouter(systemMsg: string, userMsg: string): Promise<any> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-flash-1.5",
      messages: [{ role: "system", content: systemMsg }, { role: "user", content: userMsg }],
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("OpenRouter error");
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content || "{}");
}

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
  const sysMsg = type === "image"
    ? "Write a short English product ad image prompt (max 200 chars). Return JSON: {prompt: string, hashtags: string[]}"
    : "Write a short English cinematic video prompt (max 150 chars) for UGC. Return JSON: {prompt: string, hashtags: string[]}";
  if (process.env.OPENROUTER_API_KEY) {
    try { return await callOpenRouter(sysMsg, text + avatarHint); } catch { /**/ }
  }
  if (groq) {
    try {
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
      generateImage(prompt).then(videoUrl =>
        store.updateVideo(video.id, { status: "completed", videoUrl })
      ).catch(() =>
        store.updateVideo(video.id, { status: "failed" })
      );
    } else {
      // Try to submit to Kling AI immediately for fast generation
      let klingTaskId: string | null = null;
      if (process.env.KLING_API_KEY && process.env.KLING_API_SECRET) {
        try { klingTaskId = await submitKlingTask(prompt); } catch { /**/ }
      }

      await put(`queue/${video.id}.json`, JSON.stringify({
        videoId: video.id, prompt, retries: 0, type, createdAt: new Date().toISOString(),
        ...(klingTaskId ? { klingTaskId, engine: "kling" } : { engine: "hf" }),
      }), { access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN });
    }

    return NextResponse.json({ success: true, videoId: video.id, hashtags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
