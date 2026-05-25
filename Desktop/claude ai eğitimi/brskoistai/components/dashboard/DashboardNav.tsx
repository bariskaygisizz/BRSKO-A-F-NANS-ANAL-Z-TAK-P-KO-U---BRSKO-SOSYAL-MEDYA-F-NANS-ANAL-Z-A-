"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Zap, LogOut, Crown } from "lucide-react";

interface Props {
  user: { name?: string; email?: string; plan?: string; credits?: number };
}

export default function DashboardNav({ user }: Props) {
  const planColors: Record<string, string> = {
    free: "text-zinc-400",
    starter: "text-purple-400",
    pro: "text-yellow-400",
  };

  return (
    <nav className="glass-dark border-b border-white/5 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="gradient-text hidden sm:block">BrskoistAI</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">{user.name}</div>
            <div className={`text-xs flex items-center gap-1 ${planColors[user.plan || "free"]}`}>
              {user.plan === "pro" && <Crown size={10} />}
              {(user.plan || "free").toUpperCase()} · Sınırsız
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-zinc-500 hover:text-white transition-colors"
            title="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
