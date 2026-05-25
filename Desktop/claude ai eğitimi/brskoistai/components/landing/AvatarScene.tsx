"use client";
import { useEffect, useRef } from "react";

const avatars = [
  { x: 8, y: 60, delay: 0, scale: 0.8, color: "#8b6fff" },
  { x: 88, y: 30, delay: 1.2, scale: 0.6, color: "#ff47a8" },
  { x: 20, y: 80, delay: 2.4, scale: 0.7, color: "#47c8ff" },
  { x: 75, y: 70, delay: 0.8, scale: 0.9, color: "#8b6fff" },
  { x: 50, y: 15, delay: 1.8, scale: 0.65, color: "#ff47a8" },
  { x: 35, y: 55, delay: 3.0, scale: 0.75, color: "#47c8ff" },
  { x: 92, y: 55, delay: 0.4, scale: 0.85, color: "#a855f7" },
  { x: 5, y: 30, delay: 2.0, scale: 0.6, color: "#ec4899" },
];

function Avatar({ x, y, delay, scale, color }: typeof avatars[0]) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale})`,
        animation: `avatarFloat 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.15,
      }}
    >
      <svg width="48" height="72" viewBox="0 0 48 72" fill="none">
        {/* Head */}
        <circle cx="24" cy="14" r="10" fill={color} />
        {/* Body */}
        <ellipse cx="24" cy="36" rx="12" ry="14" fill={color} opacity="0.8" />
        {/* Left arm */}
        <rect x="6" y="26" width="8" height="20" rx="4" fill={color} opacity="0.7"
          style={{ transformOrigin: "10px 26px", animation: `armSwing 2s ease-in-out infinite`, animationDelay: `${delay}s` }} />
        {/* Right arm */}
        <rect x="34" y="26" width="8" height="20" rx="4" fill={color} opacity="0.7"
          style={{ transformOrigin: "38px 26px", animation: `armSwing 2s ease-in-out infinite reverse`, animationDelay: `${delay}s` }} />
        {/* Left leg */}
        <rect x="13" y="48" width="9" height="22" rx="4" fill={color} opacity="0.6"
          style={{ transformOrigin: "17px 48px", animation: `legSwing 1.8s ease-in-out infinite`, animationDelay: `${delay}s` }} />
        {/* Right leg */}
        <rect x="26" y="48" width="9" height="22" rx="4" fill={color} opacity="0.6"
          style={{ transformOrigin: "30px 48px", animation: `legSwing 1.8s ease-in-out infinite reverse`, animationDelay: `${delay}s` }} />
        {/* Glow */}
        <circle cx="24" cy="14" r="12" fill={color} opacity="0.15" />
      </svg>
      {/* Video play indicator */}
      <div
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: color, opacity: 0.9, animation: `ping 2s ease-in-out infinite`, animationDelay: `${delay + 0.5}s` }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
          <polygon points="1,0 7,4 1,8" />
        </svg>
      </div>
    </div>
  );
}

export default function AvatarScene() {
  return (
    <>
      <style>{`
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px) scale(var(--s, 0.8)); }
          50% { transform: translateY(-18px) scale(var(--s, 0.8)); }
        }
        @keyframes armSwing {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes legSwing {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.9; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid floor */}
        <div className="absolute bottom-0 left-0 right-0 h-64"
          style={{
            background: "linear-gradient(transparent, rgba(108,71,255,0.05))",
            backgroundImage: "linear-gradient(rgba(108,71,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,71,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Scanline effect */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,71,255,0.3) 2px, rgba(108,71,255,0.3) 4px)",
          }}
        />

        {/* Avatars */}
        {avatars.map((a, i) => <Avatar key={i} {...a} />)}

        {/* Floating UGC badges */}
        {[
          { x: 15, y: 40, label: "1.2M views", delay: 0.5 },
          { x: 70, y: 20, label: "🔥 Trending", delay: 1.5 },
          { x: 82, y: 65, label: "↑ Sales +340%", delay: 2.5 },
          { x: 40, y: 75, label: "✓ Published", delay: 0.2 },
        ].map((b, i) => (
          <div key={i}
            className="absolute text-xs font-mono px-2 py-1 rounded-full border pointer-events-none"
            style={{
              left: `${b.x}%`, top: `${b.y}%`,
              borderColor: "rgba(108,71,255,0.3)",
              background: "rgba(108,71,255,0.1)",
              color: "rgba(139,111,255,0.8)",
              animation: `avatarFloat 5s ease-in-out infinite`,
              animationDelay: `${b.delay}s`,
            }}
          >
            {b.label}
          </div>
        ))}

        {/* Corner circuit lines */}
        <svg className="absolute top-0 left-0 w-64 h-64 opacity-10" viewBox="0 0 200 200">
          <path d="M0,50 L30,50 L30,20 L80,20" stroke="#8b6fff" strokeWidth="1" fill="none" />
          <path d="M0,80 L50,80 L50,120 L90,120" stroke="#ff47a8" strokeWidth="1" fill="none" />
          <circle cx="30" cy="50" r="3" fill="#8b6fff" />
          <circle cx="50" cy="80" r="3" fill="#ff47a8" />
        </svg>
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-10 scale-x-[-1]" viewBox="0 0 200 200">
          <path d="M0,50 L30,50 L30,20 L80,20" stroke="#47c8ff" strokeWidth="1" fill="none" />
          <path d="M0,80 L50,80 L50,120 L90,120" stroke="#8b6fff" strokeWidth="1" fill="none" />
          <circle cx="30" cy="50" r="3" fill="#47c8ff" />
          <circle cx="50" cy="80" r="3" fill="#8b6fff" />
        </svg>
      </div>
    </>
  );
}
