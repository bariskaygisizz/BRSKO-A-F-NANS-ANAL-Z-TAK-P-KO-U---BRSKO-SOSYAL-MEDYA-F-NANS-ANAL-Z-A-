import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="gradient-text">BrskoistAI</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link>
            <a href="mailto:support@brskoistai.com" className="hover:text-white transition-colors">Destek</a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© 2025 BrskoistAI. Tüm hakları saklıdır.</p>
          <p>Sora 2 · GPT-4o · Blotato ile güçlendirildi</p>
        </div>
      </div>
    </footer>
  );
}
