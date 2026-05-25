import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Bu email zaten kayıtlı" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, plan: "free" },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err?.message, err?.stack);
    return NextResponse.json({ error: err?.message || "Sunucu hatası" }, { status: 500 });
  }
}
