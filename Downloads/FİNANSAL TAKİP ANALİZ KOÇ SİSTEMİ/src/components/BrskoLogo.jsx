import React from 'react';

const FONT = '-apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif';

export default function BrskoLogo({ size = 40, showText = false, textColor = '#1D1D1F', textSize }) {
  const ts = textSize ?? Math.round(size * 0.4);
  const gap = Math.round(size * 0.28);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brsko-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0071E3" />
            <stop offset="100%" stopColor="#5856D6" />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect width="80" height="80" rx="18" fill="url(#brsko-bg)" />

        {/* Ascending bars — financial growth */}
        <rect x="13" y="51" width="13" height="15" rx="3.5" fill="rgba(255,255,255,0.4)" />
        <rect x="30" y="38" width="13" height="28" rx="3.5" fill="rgba(255,255,255,0.65)" />
        <rect x="47" y="23" width="13" height="43" rx="3.5" fill="white" />

        {/* Rising trend line */}
        <polyline
          points="19.5,47 36.5,34 53.5,19"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Arrow dot at top of trend */}
        <circle cx="53.5" cy="19" r="4.5" fill="white" />
      </svg>

      {showText && (
        <span style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: ts,
          letterSpacing: '-0.03em',
          color: textColor,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          BRSKO AI
        </span>
      )}
    </div>
  );
}
