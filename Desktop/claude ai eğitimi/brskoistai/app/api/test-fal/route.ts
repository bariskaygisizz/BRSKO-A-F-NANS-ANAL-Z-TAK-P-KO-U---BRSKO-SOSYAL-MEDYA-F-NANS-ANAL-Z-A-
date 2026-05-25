import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MODELS = [
  {
    id: "fal-ai/fast-animatediff",
    body: { model_name: "lykon/dreamshaper-8", prompt: "product ad", num_frames: 16, fps: 8 },
  },
  {
    id: "fal-ai/animatediff-sparsectrl-lcm",
    body: { prompt: "product ad", num_frames: 16 },
  },
  {
    id: "fal-ai/minimax/video-01",
    body: { prompt: "product ad" },
  },
  {
    id: "fal-ai/mochi-v1",
    body: { prompt: "product ad" },
  },
  {
    id: "fal-ai/ltx-video",
    body: { prompt: "product ad", num_frames: 25 },
  },
  {
    id: "fal-ai/flux/schnell",
    body: { prompt: "product ad" },
  },
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) return NextResponse.json({ error: "FAL_API_KEY eksik" });

  const results: Record<string, any> = {};

  for (const m of MODELS) {
    try {
      const res = await fetch(`https://queue.fal.run/${m.id}`, {
        method: "POST",
        headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(m.body),
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      let parsed: any = {};
      try { parsed = JSON.parse(text); } catch { /**/ }
      results[m.id] = {
        http_status: res.status,
        ok: res.ok,
        request_id: parsed?.request_id ?? null,
        error: parsed?.detail ?? parsed?.error ?? parsed?.message ?? null,
        raw: text.slice(0, 200),
      };
      if (res.ok && parsed?.request_id) break; // found working model
    } catch (e: any) {
      results[m.id] = { error: e.message };
    }
  }

  return NextResponse.json({
    key_prefix: FAL_KEY.slice(0, 12) + "...",
    key_length: FAL_KEY.length,
    results,
  });
}
