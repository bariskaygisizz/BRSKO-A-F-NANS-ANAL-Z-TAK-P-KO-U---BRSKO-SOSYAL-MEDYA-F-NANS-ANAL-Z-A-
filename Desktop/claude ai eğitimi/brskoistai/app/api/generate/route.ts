import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function geminiPrompt(sysMsg: string, userMsg: string): Promise<any> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: sysMsg + "\n\n" + userMsg }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) throw new Error("Gemini error");
  const data = await res.json();
  return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
}

async function uploadToTmp(buf: ArrayBuffer, mime: string, name: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime }), name);
  const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
  const ud = await up.json();
  return (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
}

async function generateImage(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: prompt.slice(0, 500) }],
        parameters: { sampleCount: 1, aspectRatio: "3:4" },
      }),
      signal: AbortSignal.timeout(30000),
    }
  );
  if (!res.ok) throw new Error(`Imagen error ${res.status}`);
  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("No image returned");
  const buf = Buffer.from(b64, "base64");
  return uploadToTmp(buf.buffer as ArrayBuffer, "image/jpeg", "ugc.jpg");
}

async function buildPrompt(text: string, type: string, withAvatar: boolean) {
  const hint = withAvatar ? " Include a UGC creator person holding the product." : "";
  const sysMsg = type === "image"
    ? "Write a short English product ad image prompt (max 200 chars). Return JSON: {prompt: string, hashtags: string[]}"
    : "Write a short English cinematic UGC video prompt (max 150 chars). Return JSON: {prompt: string, hashtags: string[]}";
  try { return await geminiPrompt(sysMsg, text + hint); } catch { /**/ }
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

    const limitCheck = await store.incrementAiCount(session.user.email);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "Aylık AI üretim limitiniz doldu.", limitExceeded: true }, { status: 429 });
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

    // Video: HuggingFace queue (Google Veo API henüz yok)
    await put(`queue/${video.id}.json`, JSON.stringify({
      videoId: video.id, prompt, retries: 0, engine: "hf",
      createdAt: new Date().toISOString(),
    }), { access: "private", addRandomSuffix: false, allowOverwrite: true, token: TOKEN });

    return NextResponse.json({ success: true, videoId: video.id, hashtags, engine: "hf" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
