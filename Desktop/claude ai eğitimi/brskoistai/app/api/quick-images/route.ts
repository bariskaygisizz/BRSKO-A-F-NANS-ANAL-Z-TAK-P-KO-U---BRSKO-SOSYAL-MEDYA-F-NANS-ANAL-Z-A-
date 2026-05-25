import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function generateOne(prompt: string, hfToken: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo", {
      method: "POST",
      headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json", "x-wait-for-model": "true" },
      body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4, guidance_scale: 0.0 } }),
      signal: AbortSignal.timeout(40000),
    }).catch(() => null);

    if (!res) continue;
    if (res.status === 503) { await new Promise(r => setTimeout(r, 5000)); continue; }
    if (!res.ok) return null;

    const buf = await res.arrayBuffer();
    const form = new FormData();
    form.append("file", new Blob([buf], { type: "image/jpeg" }), "img.jpg");
    const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
    const ud = await up.json();
    const raw: string = ud?.data?.url || "";
    return raw.replace(/^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i, "https://tmpfiles.org/dl/$1/$2");
  }
  return null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });

  const HF = process.env.HF_TOKEN;
  if (!HF) return NextResponse.json({ error: "Servis yapılandırılmamış" }, { status: 503 });

  const fullPrompt = `professional product photography, ${prompt}, studio lighting, commercial quality, high resolution`;

  // Generate 2 images in parallel (HF rate limit safe)
  const [img1, img2] = await Promise.all([
    generateOne(fullPrompt, HF),
    generateOne(fullPrompt + ", different angle", HF),
  ]);

  const images = [img1, img2].filter(Boolean) as string[];
  if (images.length === 0) {
    return NextResponse.json({ error: "Model meşgul, 30 saniye sonra tekrar deneyin." }, { status: 503 });
  }

  return NextResponse.json({ images });
}
