import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const FAL_VIDEO_MODELS = [
  { id: "fal-ai/fast-animatediff", body: (p: string) => ({ prompt: p, num_frames: 16, fps: 8, num_inference_steps: 25, width: 512, height: 512 }) },
  { id: "fal-ai/minimax/video-01", body: (p: string) => ({ prompt: p }) },
  { id: "fal-ai/mochi-v1",         body: (p: string) => ({ prompt: p }) },
  { id: "fal-ai/ltx-video",        body: (p: string) => ({ prompt: p }) },
];

async function tryFal(prompt: string): Promise<{ requestId: string; model: string } | null> {
  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) return null;
  for (const m of FAL_VIDEO_MODELS) {
    try {
      const res = await fetch(`https://queue.fal.run/${m.id}`, {
        method: "POST",
        headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(m.body(prompt.slice(0, 500))),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const requestId = data?.request_id ?? null;
      if (requestId) return { requestId, model: m.id };
    } catch { /**/ }
  }
  return null;
}

async function callOpenRouter(sysMsg: string, userMsg: string): Promise<any> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-flash-1.5",
      messages: [{ role: "system", content: sysMsg }, { role: "user", content: userMsg }],
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(10000),
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
  for (let i = 0; i < 5; i++) {
    const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json", "x-wait-for-model": "true" },
      body: JSON.stringify({ inputs: prompt.slice(0, 300) }),
      signal: AbortSignal.timeout(50000),
    }).catch(() => null);
    if (!res) continue;
    if (res.status === 503) { await new Promise(r => setTimeout(r, 8000)); continue; }
    if (!res.ok) throw new Error(`HF ${res.status}`);
    return uploadToTmp(await res.arrayBuffer(), "image/jpeg", "ugc.jpg");
  }
  throw new Error("Görsel üretimi başarısız");
}

async function buildPrompt(text: string, type: string, withAvatar: boolean) {
  const hint = withAvatar ? " Include a UGC creator person holding the product." : "";
  const sysMsg = type === "image"
    ? "Write a short English product ad image prompt (max 200 chars). Return JSON: {prompt: string, hashtags: string[]}"
    : "Write a short English cinematic UGC video prompt (max 150 chars). Return JSON: {prompt: string, hashtags: string[]}";
  if (process.env.OPENROUTER_API_KEY) {
    try { return await callOpenRouter(sysMsg, text + hint); } catch { /**/ }
  }
  if (groq) {
    try {
      const r = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: sysMsg }, { role: "user", content: text + hint }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      return JSON.parse(r.choices[0].message.content || "{}");
    } catch { /**/ }
  }
  return { prompt: (text + hint).slice(0, 200), hashtags: [] };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const { imageUrl, promotionText, type = "video", withAvatar = false } = await req.json();
    if (!promotionText) return NextResponse.json({ error: "Tanıtım metni gerekli" }, { status: 400 });

    // Monthly limit check
    const limitCheck = await store.incrementAiCount(session.user.email);
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: "Aylık AI üretim limitiniz doldu.",
        limitExceeded: true,
      }, { status: 429 });
    }

    const { prompt, hashtags } = await buildPrompt(promotionText, type, withAvatar);

    const video = await store.createVideo({
      userId: session.user.id,
      title: promotionText.slice(0, 60),
      prompt,
      imageUrl: imageUrl || null,
      type,
    });

    if (type === "image") {
      generateImage(prompt)
        .then(videoUrl => store.updateVideo(video.id, { status: "completed", videoUrl }))
        .catch(() => store.updateVideo(video.id, { status: "failed" }));
      return NextResponse.json({ success: true, videoId: video.id, hashtags });
    }

    // Try fal.ai first (fast), fall back to HuggingFace queue
    const falResult = await tryFal(prompt);

    if (falResult) {
      await put(`queue/${video.id}.json`, JSON.stringify({
        videoId: video.id, prompt, retries: 0,
        engine: "fal",
        falRequestId: falResult.requestId,
        falModel: falResult.model,
        createdAt: new Date().toISOString(),
      }), { access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN });
    } else {
      // HuggingFace fallback — slower but always available
      await put(`queue/${video.id}.json`, JSON.stringify({
        videoId: video.id, prompt, retries: 0,
        engine: "hf",
        createdAt: new Date().toISOString(),
      }), { access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN });
    }

    return NextResponse.json({
      success: true,
      videoId: video.id,
      hashtags,
      engine: falResult ? "fal" : "hf",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
