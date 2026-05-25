import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });

  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) return NextResponse.json({ error: "Servis yapılandırılmamış" }, { status: 503 });

  try {
    // Submit to fal.ai FLUX schnell queue
    const submitRes = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.slice(0, 500), num_images: 4, image_size: "portrait_4_3" }),
      signal: AbortSignal.timeout(10000),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      return NextResponse.json({ error: `fal.ai hata: ${err.slice(0, 100)}` }, { status: 502 });
    }

    const submitData = await submitRes.json();
    const requestId = submitData?.request_id;
    if (!requestId) return NextResponse.json({ error: "request_id alınamadı" }, { status: 502 });

    // Poll until done (FLUX schnell is very fast ~2-5s)
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const statusRes = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}/status`, {
        headers: { Authorization: `Key ${FAL_KEY}` },
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      if (!statusRes || !statusRes.ok) continue;
      const statusData = await statusRes.json();
      if (statusData.status === "COMPLETED") {
        const resultRes = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}`, {
          headers: { Authorization: `Key ${FAL_KEY}` },
          signal: AbortSignal.timeout(5000),
        });
        const result = await resultRes.json();
        const images = (result?.images || []).map((img: any) => img?.url).filter(Boolean);
        return NextResponse.json({ images });
      }
      if (statusData.status === "FAILED") {
        return NextResponse.json({ error: "Görsel üretimi başarısız" }, { status: 500 });
      }
    }
    return NextResponse.json({ error: "Zaman aşımı" }, { status: 504 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
