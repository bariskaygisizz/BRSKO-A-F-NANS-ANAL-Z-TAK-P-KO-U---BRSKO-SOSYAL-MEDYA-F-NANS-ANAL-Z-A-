import React from 'react';

function Dollar({ width = 320 }) {
  return (
    <svg width={width} height={Math.round(width * 0.44)} viewBox="0 0 320 141" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="d-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4e9a51" />
          <stop offset="100%" stopColor="#2d6e30" />
        </linearGradient>
        <linearGradient id="d-oval" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3d8040" />
          <stop offset="100%" stopColor="#1e5421" />
        </linearGradient>
        <pattern id="d-lines" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Base */}
      <rect width="320" height="141" rx="7" fill="url(#d-bg)" />
      <rect width="320" height="141" rx="7" fill="url(#d-lines)" />

      {/* Outer border */}
      <rect x="5" y="5" width="310" height="131" rx="5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <rect x="9" y="9" width="302" height="123" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />

      {/* Left oval with $ */}
      <ellipse cx="58" cy="70" rx="36" ry="48" fill="url(#d-oval)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
      <text x="58" y="79" textAnchor="middle" fill="white" fillOpacity="0.95" fontSize="32" fontWeight="900" fontFamily="Georgia,serif">$</text>

      {/* Portrait oval (right) */}
      <ellipse cx="236" cy="70" rx="42" ry="52" fill="url(#d-oval)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
      {/* Face silhouette */}
      <ellipse cx="236" cy="60" rx="18" ry="22" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="236" cy="92" rx="26" ry="14" fill="rgba(255,255,255,0.08)" />

      {/* Center denomination */}
      <text x="148" y="64" textAnchor="middle" fill="white" fillOpacity="0.97" fontSize="44" fontWeight="900" fontFamily="Georgia,serif" letterSpacing="-2">100</text>

      {/* Header */}
      <text x="148" y="19" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="7" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="2.5">FEDERAL RESERVE NOTE</text>
      <text x="148" y="30" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5.5" fontFamily="Arial,sans-serif" letterSpacing="1.5">THE UNITED STATES OF AMERICA</text>

      {/* Bottom text */}
      <text x="148" y="126" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="7.5" fontWeight="600" fontFamily="Georgia,serif" letterSpacing="1">ONE HUNDRED DOLLARS</text>

      {/* Security strip */}
      <rect x="142" y="10" width="4" height="121" rx="2" fill="rgba(255,180,0,0.2)" />

      {/* Serial */}
      <text x="18" y="100" fill="rgba(255,255,255,0.35)" fontSize="5" fontFamily="Courier,monospace" letterSpacing="0.8">LB47293810A</text>

      {/* Corner numbers */}
      <text x="16" y="24" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">100</text>
      <text x="268" y="24" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">100</text>
      <text x="16" y="130" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">100</text>
      <text x="268" y="130" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">100</text>
    </svg>
  );
}

function Euro({ width = 320 }) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    return { cx: 58 + Math.cos(a) * 28, cy: 70 + Math.sin(a) * 28 };
  });
  return (
    <svg width={width} height={Math.round(width * 0.44)} viewBox="0 0 320 141" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="e-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4900a" />
          <stop offset="100%" stopColor="#9c6600" />
        </linearGradient>
        <linearGradient id="e-arc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b87800" />
          <stop offset="100%" stopColor="#7a4e00" />
        </linearGradient>
        <pattern id="e-lines" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="320" height="141" rx="7" fill="url(#e-bg)" />
      <rect width="320" height="141" rx="7" fill="url(#e-lines)" />
      <rect x="5" y="5" width="310" height="131" rx="5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <rect x="9" y="9" width="302" height="123" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />

      {/* EU star circle */}
      {stars.map((s, i) => (
        <polygon key={i}
          points={`${s.cx},${s.cy - 4} ${s.cx + 1.2},${s.cy - 1} ${s.cx + 4},${s.cy - 1} ${s.cx + 2},${s.cy + 1.5} ${s.cx + 2.5},${s.cy + 4} ${s.cx},${s.cy + 2.5} ${s.cx - 2.5},${s.cy + 4} ${s.cx - 2},${s.cy + 1.5} ${s.cx - 4},${s.cy - 1} ${s.cx - 1.2},${s.cy - 1}`}
          fill="rgba(255,255,255,0.82)" />
      ))}

      {/* € center */}
      <text x="58" y="79" textAnchor="middle" fill="white" fillOpacity="0.95" fontSize="26" fontWeight="900" fontFamily="Georgia,serif">€</text>

      {/* Arch/gate motif (right) */}
      <ellipse cx="240" cy="70" rx="44" ry="50" fill="url(#e-arc)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="222" y="78" width="8" height="30" fill="rgba(255,255,255,0.25)" />
      <rect x="250" y="78" width="8" height="30" fill="rgba(255,255,255,0.25)" />
      <path d="M220 78 Q240 52 260 78" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />

      {/* Denomination */}
      <text x="148" y="68" textAnchor="middle" fill="white" fillOpacity="0.97" fontSize="50" fontWeight="900" fontFamily="Georgia,serif">50</text>

      {/* EURO label */}
      <text x="148" y="18" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="9" fontWeight="800" fontFamily="Arial,sans-serif" letterSpacing="4">EURO</text>

      {/* ECB languages */}
      <text x="148" y="128" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="5.5" fontFamily="Arial,sans-serif" letterSpacing="0.8">EUROPEAN CENTRAL BANK · BCE · EZB · ΕΚΤ</text>

      <text x="16" y="24" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">50</text>
      <text x="280" y="24" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">50</text>
      <text x="16" y="130" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">50</text>
      <text x="280" y="130" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">50</text>

      {/* Security strip */}
      <rect x="142" y="10" width="4" height="121" rx="2" fill="rgba(255,120,0,0.18)" />
    </svg>
  );
}

function TurkishLira({ width = 320 }) {
  return (
    <svg width={width} height={Math.round(width * 0.44)} viewBox="0 0 320 141" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="t-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="t-oval" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <pattern id="t-lines" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="320" height="141" rx="7" fill="url(#t-bg)" />
      <rect width="320" height="141" rx="7" fill="url(#t-lines)" />
      <rect x="5" y="5" width="310" height="131" rx="5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <rect x="9" y="9" width="302" height="123" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />

      {/* Left oval with crescent+star */}
      <ellipse cx="58" cy="70" rx="38" ry="50" fill="url(#t-oval)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
      {/* Crescent */}
      <circle cx="54" cy="60" r="18" fill="rgba(255,255,255,0.88)" />
      <circle cx="60" cy="56" r="13" fill="url(#t-oval)" />
      {/* Star */}
      <polygon points="72,52 74,59 81,59 75,63 78,70 72,66 66,70 69,63 63,59 70,59" fill="rgba(255,255,255,0.88)" />

      {/* TCMB seal right */}
      <ellipse cx="240" cy="70" rx="42" ry="50" fill="url(#t-oval)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="240" cy="60" r="22" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <circle cx="240" cy="60" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" />
      <text x="240" y="56" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="5.5" fontFamily="Arial,sans-serif" letterSpacing="0.3">MERKEZ</text>
      <text x="240" y="64" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="5.5" fontFamily="Arial,sans-serif" letterSpacing="0.3">BANKASI</text>
      <text x="240" y="94" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Georgia,serif">₺</text>

      {/* Denomination */}
      <text x="148" y="68" textAnchor="middle" fill="white" fillOpacity="0.97" fontSize="44" fontWeight="900" fontFamily="Georgia,serif">200</text>

      {/* Header */}
      <text x="148" y="18" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="6" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="1.8">TÜRKİYE CUMHURİYET MERKEZ BANKASI</text>

      {/* Bottom */}
      <text x="148" y="128" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="Georgia,serif" letterSpacing="0.8">İKİ YÜZ TÜRK LİRASI</text>

      {/* Security strip */}
      <rect x="142" y="10" width="4" height="121" rx="2" fill="rgba(200,100,255,0.2)" />

      {/* Serial */}
      <text x="18" y="100" fill="rgba(255,255,255,0.3)" fontSize="5" fontFamily="Courier,monospace" letterSpacing="0.8">E09 384726</text>

      <text x="16" y="24" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">200</text>
      <text x="262" y="24" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">200</text>
      <text x="16" y="130" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">200</text>
      <text x="262" y="130" fill="rgba(255,255,255,0.65)" fontSize="12" fontWeight="800" fontFamily="Georgia,serif">200</text>
    </svg>
  );
}

const NOTES = [
  { C: Dollar,      x: '-4%',  y: '8%',  rot: -14, scale: 0.88, op: 0.13, dur: 8.5, del: 0   },
  { C: Euro,        x: '58%',  y: '3%',  rot: 9,   scale: 0.78, op: 0.11, dur: 9.2, del: 1.8 },
  { C: TurkishLira, x: '22%',  y: '68%', rot: -7,  scale: 0.82, op: 0.11, dur: 7.8, del: 0.6 },
  { C: Dollar,      x: '68%',  y: '54%', rot: 16,  scale: 0.68, op: 0.09, dur: 10,  del: 2.4 },
  { C: Euro,        x: '-2%',  y: '56%', rot: -18, scale: 0.72, op: 0.09, dur: 8.8, del: 3.2 },
  { C: TurkishLira, x: '50%',  y: '76%', rot: 11,  scale: 0.62, op: 0.08, dur: 9.6, del: 1.1 },
  { C: Dollar,      x: '82%',  y: '18%', rot: -8,  scale: 0.74, op: 0.09, dur: 7.5, del: 4.0 },
];

export default function FloatingBanknotes() {
  return (
    <>
      {NOTES.map((n, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: n.x, top: n.y,
          transform: `rotate(${n.rot}deg) scale(${n.scale})`,
          transformOrigin: 'center center',
          opacity: n.op,
          animation: `floatY ${n.dur}s ease-in-out ${n.del}s infinite`,
          pointerEvents: 'none',
          userSelect: 'none',
          filter: 'blur(0.3px) drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
        }}>
          <n.C width={340} />
        </div>
      ))}
    </>
  );
}
