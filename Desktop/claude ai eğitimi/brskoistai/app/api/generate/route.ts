import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

async function uploadToTmp(buf: ArrayBuffer, mime: string, name: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime }), name);
  const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
  const ud = await up.json();
  return (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
}

async function generateVideo(prompt: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch("https://api-inference.huggingface.co/models/cerspense/zeroscope_v2_576w", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({ inputs: prompt.slice(0, 200) }),
      signal: AbortSignal.timeout(120000),
    });
    if (res.status === 503) {
      const d = await res.json().catch(() => ({}));
      await new Promise(r => setTimeout(r, Math.min((d.estimated_time || 30) * 1000, 40000)));
      continue;
    }
    if (!res.ok) throw new Error(`HF video error: ${res.status}`);
    const buf = await res.arrayBuffer();
    return uploadToTmp(buf, "video/mp4", "ugc.mp4");
  }
  throw new Error("Video üretimi başarısız");
}

async function generateImage(prompt: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({ inputs: prompt.slice(0, 300) }),
      signal: AbortSignal.timeout(120000),
    });
    if (res.status === 503) {
      const d = await res.json().catch(() => ({}));
      await new Promise(r => setTimeout(r, Math.min((d.estimated_time || 30) * 1000, 40000)));
      continue;
    }
    if (!res.ok) throw new Error(`HF image error: ${res.status}`);
    const buf = await res.arrayBuffer();
    return uploadToTmp(buf, "image/jpeg", "ugc.jpg");
  }
  throw new Error("Görsel üretimi başarısız");
}

async function buildPrompt(
  promotionText: string,
  type: "video" | "image",
  withAvatar: boolean
): Promise<{ prompt: string; hashtags: string[] }> {
  const avatarHint = withAvatar ? " Include a UGC creator person holding the product." : "";
  const typeHint = type === "image"
    ? "Write a short English product ad image prompt (max 200 chars). Return JSON: {prompt: string, hashtags: string[]}"
    : "Write a short English cinematic video prompt (max 150 chars) for a product UGC video. Return JSON: {prompt: string, hashtags: string[]}";

  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: typeHint },
          { role: "user", content: promotionText + avatarHint },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      return JSON.parse(res.choices[0].message.content || "{}");
    } catch { /* fall through */ }
  }
  return { prompt: (promotionText + avatarHint).slice(0, 200), hashtags: [] };
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

    after(async () => {
      try {
        const videoUrl = type === "image"
          ? await generateImage(prompt)
          : await generateVideo(prompt);
        await store.updateVideo(video.id, { status: "completed", videoUrl });
      } catch {
        await store.updateVideo(video.id, { status: "failed" });
      }
    });

    return NextResponse.json({ success: true, videoId: video.id, hashtags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
