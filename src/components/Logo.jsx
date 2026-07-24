import React from 'react';

const Logo = ({ variant = 'full', width, height, className = '' }) => {
  // Default sizes based on variant
  const defaultWidth = variant === 'full' ? '200px' : '48px';
  const defaultHeight = variant === 'full' ? '200px' : '48px';

  const w = width || defaultWidth;
  const h = height || defaultHeight;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        {/* Premium Metallic Gold Gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="30%" stopColor="#d5a848" />
          <stop offset="70%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#916600" />
        </linearGradient>
        {/* Subtle dark background gradient for the circle */}
        <radialGradient id="darkBg" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#0d1b2e" />
          <stop offset="100%" stopColor="#050a14" />
        </radialGradient>
      </defs>

      {/* Circular Badge Background */}
      <circle cx="100" cy="100" r="92" fill="url(#darkBg)" />

      {/* Golden Outer Border */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="url(#goldGradient)" strokeWidth="3" />

      {/* === Stylized ERN === */}
      {/* Letter E */}
      {/* White parts: vertical stem & bottom horizontal arm */}
      <path d="M 40 60 L 50 60 L 50 100 L 70 100 L 70 110 L 40 110 Z" fill="#ffffff" />
      {/* Gold parts: top horizontal arm & middle horizontal arm */}
      <rect x="50" y="60" width="20" height="10" fill="url(#goldGradient)" />
      <rect x="50" y="81" width="16" height="8" fill="url(#goldGradient)" />

      {/* Letter R (White) */}
      <path
        d="M 77 60 H 102 C 109 60 112 64 112 72.5 C 112 80 108 84 101 85 L 113 110 H 101 L 91 87 H 87 V 110 H 77 V 60 Z M 87 70 V 78 H 99 C 102 78 102.5 76.5 102.5 74 C 102.5 71.5 102 70 99 70 H 87 Z"
        fill="#ffffff"
      />

      {/* Letter N (White) */}
      <path d="M 120 60 H 130 L 150 100 V 60 H 160 V 110 H 150 L 130 70 V 110 H 120 Z" fill="#ffffff" />

      {/* === TOPTAN Section === */}
      {variant === 'full' ? (
        <>
          {/* Left Decorative Line */}
          <line x1="38" y1="125" x2="62" y2="125" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* T O P T A N text */}
          <text
            x="100"
            y="129"
            fill="url(#goldGradient)"
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="800"
            fontSize="12.5"
            letterSpacing="5"
            textAnchor="middle"
          >
            TOPTAN
          </text>
          
          {/* Right Decorative Line */}
          <line x1="138" y1="125" x2="162" y2="125" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Subtext Categories */}
          <text
            x="100"
            y="148"
            fill="url(#goldGradient)"
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="600"
            fontSize="6.5"
            letterSpacing="1.8"
            textAnchor="middle"
            opacity="0.95"
          >
            HEDİYELİK • OYUNCAK
          </text>
          <text
            x="100"
            y="160"
            fill="url(#goldGradient)"
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="600"
            fontSize="6.5"
            letterSpacing="1.8"
            textAnchor="middle"
            opacity="0.95"
          >
            KIRTASİYE • AKSESUAR
          </text>
          <text
            x="100"
            y="172"
            fill="url(#goldGradient)"
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="600"
            fontSize="6.5"
            letterSpacing="1.8"
            textAnchor="middle"
            opacity="0.95"
          >
            ELEKTRONİK
          </text>
        </>
      ) : (
        <>
          {/* Simplified T O P T A N for icon view (larger text, no subtext, no lines) */}
          <text
            x="100"
            y="142"
            fill="url(#goldGradient)"
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="800"
            fontSize="15"
            letterSpacing="6"
            textAnchor="middle"
          >
            TOPTAN
          </text>
        </>
      )}
    </svg>
  );
};

export default Logo;
