"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Kayıt başarısız");
      setLoading(false);
      return;
    }

    // Auto sign in
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInRes?.ok) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  }

  const perks = ["3 ücretsiz video kredisi", "Kredi kartı gerekmez", "2 dakikada kurulum"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="gradient-text">BrskoistAI</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Ücretsiz Başlayın</h1>
          <p className="text-zinc-400 text-sm mt-1">3 ücretsiz video ile deneyin</p>
        </div>

        {/* Perks */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-xs text-green-400 glass px-3 py-1.5 rounded-full">
              <Check size={12} />
              {p}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Adınız Soyadınız"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Şifre</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="En az 8 karakter"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Kayıt olarak{" "}
              <Link href="/terms" className="text-purple-400 hover:underline">Kullanım Şartları</Link>
              {" "}ve{" "}
              <Link href="/privacy" className="text-purple-400 hover:underline">Gizlilik Politikası</Link>
              &apos;nı kabul ediyorsunuz.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Hesap oluşturuluyor..." : "Ücretsiz Hesap Oluştur"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Zaten hesabınız var mı?{" "}
          <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
