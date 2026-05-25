"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="gradient-text">BrskoistAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">Nasıl Çalışır</a>
          <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Özellikler</a>
          <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Fiyatlar</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/signin" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
            Giriş Yap
          </Link>
          <Link href="/auth/signup" className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-full transition-all">
            Ücretsiz Başla
          </Link>
        </div>

        <button className="md:hidden text-zinc-400" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-dark px-4 pb-4 flex flex-col gap-3">
          <a href="#how-it-works" className="text-sm text-zinc-400 py-2" onClick={() => setOpen(false)}>Nasıl Çalışır</a>
          <a href="#features" className="text-sm text-zinc-400 py-2" onClick={() => setOpen(false)}>Özellikler</a>
          <a href="#pricing" className="text-sm text-zinc-400 py-2" onClick={() => setOpen(false)}>Fiyatlar</a>
          <Link href="/auth/signin" className="text-sm text-zinc-400 py-2">Giriş Yap</Link>
          <Link href="/auth/signup" className="text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-full text-center">
            Ücretsiz Başla
          </Link>
        </div>
      )}
    </nav>
  );
}
