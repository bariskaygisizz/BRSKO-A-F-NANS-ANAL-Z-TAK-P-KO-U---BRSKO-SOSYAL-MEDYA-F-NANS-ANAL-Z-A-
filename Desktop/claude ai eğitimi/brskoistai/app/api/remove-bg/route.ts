import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "Görsel gerekli" }, { status: 400 });

    // Fetch original image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Görsel yüklenemedi");
    const imgBuf = await imgRes.arrayBuffer();

    // HuggingFace rembg
    const hfRes = await fetch("https://api-inference.huggingface.co/models/briaai/RMBG-1.4", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "image/png",
        "x-wait-for-model": "true",
      },
      body: imgBuf,
      signal: AbortSignal.timeout(60000),
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text().catch(() => "");
      throw new Error(`Arka plan silinemedi: ${hfRes.status} ${errText.slice(0, 100)}`);
    }

    const resultBuf = await hfRes.arrayBuffer();
    const form = new FormData();
    form.append("file", new Blob([resultBuf], { type: "image/png" }), "nobg.png");
    const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
    const ud = await up.json();
    const resultUrl = (ud?.data?.url || "").replace(
      /^http:\/\/tmpfiles\.org\/(\d+)\/(.*)$/i,
      "https://tmpfiles.org/dl/$1/$2"
    );

    return NextResponse.json({ resultUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Hata oluştu" }, { status: 500 });
  }
}
