import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// ComfyUI: local free unlimited video generation
async function generateWithComfyUI(prompt: string, imageUrl?: string): Promise<string> {
  const base = process.env.COMFYUI_URL || "http://localhost:8188";

  // Simple AnimateDiff/Wan workflow
  const workflow = {
    "1": { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["4", 1] } },
    "2": { class_type: "KSampler", inputs: { seed: Math.floor(Math.random() * 99999), steps: 20, cfg: 7, sampler_name: "euler", scheduler: "normal", denoise: 1, model: ["4", 0], positive: ["1", 0], negative: ["3", 0], latent_image: ["5", 0] } },
    "3": { class_type: "CLIPTextEncode", inputs: { text: "bad quality, blurry, distorted", clip: ["4", 1] } },
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "v1-5-pruned.ckpt" } },
    "5": { class_type: "EmptyLatentImage", inputs: { width: 512, height: 512, batch_size: 1 } },
    "6": { class_type: "VAEDecode", inputs: { samples: ["2", 0], vae: ["4", 2] } },
    "7": { class_type: "SaveImage", inputs: { filename_prefix: "ugc", images: ["6", 0] } }
  };

  const promptRes = await fetch(`${base}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow }),
    signal: AbortSignal.timeout(10000),
  });
  if (!promptRes.ok) throw new Error("ComfyUI bağlanamadı");
  const { prompt_id } = await promptRes.json();

  // Poll for result
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const hist = await fetch(`${base}/history/${prompt_id}`);
    const data = await hist.json();
    if (data[prompt_id]?.status?.completed) {
      const outputs = data[prompt_id].outputs;
      for (const node of Object.values(outputs) as any[]) {
        if (node.images?.[0]) {
          const img = node.images[0];
          return `${base}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`;
        }
        if (node.gifs?.[0]) {
          const gif = node.gifs[0];
          return `${base}/view?filename=${gif.filename}&subfolder=${gif.subfolder}&type=${gif.type}`;
        }
      }
    }
  }
  throw new Error("ComfyUI zaman aşımı");
}

// HuggingFace fallback (free, slower)
async function generateWithHF(prompt: string): Promise<string> {
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
    if (!res.ok) throw new Error(`HF error: ${res.status}`);
    const buf = await res.arrayBuffer();
    const form = new FormData();
    form.append("file", new Blob([buf], { type: "video/mp4" }), "ugc.mp4");
    const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
    const ud = await up.json();
    return (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
  }
  throw new Error("Video üretimi başarısız");
}

async function buildPrompt(promotionText: string): Promise<{ prompt: string; hashtags: string[] }> {
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Write a short English cinematic video prompt (max 150 chars) for a product UGC video. Return JSON: {prompt: string, hashtags: string[]}" },
          { role: "user", content: promotionText },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      return JSON.parse(res.choices[0].message.content || "{}");
    } catch { /* fall through */ }
  }
  return { prompt: promotionText.slice(0, 150), hashtags: [] };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

    const { imageUrl, promotionText } = await req.json();
    if (!promotionText) return NextResponse.json({ error: "Tanıtım metni gerekli" }, { status: 400 });

    const { prompt, hashtags } = await buildPrompt(promotionText);

    const video = await prisma.video.create({
      data: { userId: session.user.id, title: promotionText.slice(0, 60), prompt, imageUrl: imageUrl || null, status: "processing" },
    });

    after(async () => {
      try {
        let videoUrl: string;
        // Try ComfyUI first (local, free, unlimited)
        try {
          videoUrl = await generateWithComfyUI(prompt, imageUrl);
        } catch {
          // Fallback to HuggingFace
          videoUrl = await generateWithHF(prompt);
        }
        await prisma.video.update({ where: { id: video.id }, data: { videoUrl, status: "completed" } });
      } catch (err: any) {
        await prisma.video.update({ where: { id: video.id }, data: { status: "failed" } });
      }
    });

    return NextResponse.json({ success: true, videoId: video.id, hashtags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
