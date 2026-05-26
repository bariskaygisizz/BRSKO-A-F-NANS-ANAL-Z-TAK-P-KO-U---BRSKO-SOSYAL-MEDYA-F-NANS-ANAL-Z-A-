import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function uploadToTmp(buf: ArrayBuffer, mime: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime }), "img.jpg");
  const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
  const ud = await up.json();
  return (ud?.data?.url || "").replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
}

async function generateWithGemini(prompt: string): Promise<string[]> {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const results: string[] = [];

  for (let i = 0; i < 2; i++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: prompt + (i === 1 ? ", different angle, lifestyle" : "") }],
          parameters: { sampleCount: 2, aspectRatio: "3:4" },
        }),
        signal: AbortSignal.timeout(30000),
      }
    ).catch(() => null);

    if (!res || !res.ok) continue;
    const data = await res.json();
    const preds = data?.predictions || [];
    for (const p of preds) {
      const b64 = p?.bytesBase64Encoded;
      if (!b64) continue;
      const buf = Buffer.from(b64, "base64");
      const url = await uploadToTmp(buf.buffer as ArrayBuffer, "image/jpeg");
      if (url) results.push(url);
    }
  }
  return results;
}

async function generateWithHF(prompt: string): Promise<string[]> {
  const HF = process.env.HF_TOKEN;
  if (!HF) return [];
  const results: string[] = [];
  for (let i = 0; i < 2; i++) {
    const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo", {
      method: "POST",
      headers: { Authorization: `Bearer ${HF}`, "Content-Type": "application/json", "x-wait-for-model": "true" },
      body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4, guidance_scale: 0.0 } }),
      signal: AbortSignal.timeout(40000),
    }).catch(() => null);
    if (!res || !res.ok || res.status === 503) continue;
    const url = await uploadToTmp(await res.arrayBuffer(), "image/jpeg");
    if (url) results.push(url);
  }
  return results;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });

  const fullPrompt = `professional product photography, ${prompt}, studio lighting, commercial quality, white background`;

  // Try Gemini Imagen first, fallback to HuggingFace
  let images: string[] = [];
  if (process.env.GEMINI_API_KEY) {
    images = await generateWithGemini(fullPrompt).catch(() => []);
  }
  if (images.length === 0) {
    images = await generateWithHF(fullPrompt).catch(() => []);
  }

  if (images.length === 0) {
    return NextResponse.json({ error: "Model meşgul, tekrar deneyin." }, { status: 503 });
  }

  return NextResponse.json({ images });
}
