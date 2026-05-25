import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const FAL_KEY = process.env.FAL_API_KEY;
  if (!FAL_KEY) return NextResponse.json({ error: "FAL_API_KEY yok" }, { status: 500 });

  const models = [
    "fal-ai/fast-animatediff/v2/turbo",
    "fal-ai/minimax/video-01",
    "fal-ai/fast-svd-lcm",
    "fal-ai/stable-video",
  ];

  const results: Record<string, any> = {};

  for (const model of models) {
    try {
      const res = await fetch(`https://queue.fal.run/${model}`, {
        method: "POST",
        headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "test video of a product" }),
        signal: AbortSignal.timeout(10000),
      });
      const text = await res.text();
      results[model] = { status: res.status, body: text.slice(0, 300) };
    } catch (e: any) {
      results[model] = { error: e.message };
    }
  }

  return NextResponse.json({ key_prefix: FAL_KEY.slice(0, 8) + "...", results });
}
