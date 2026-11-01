import React from "react";

// ============================================================================
// THE ORIGIN FOUNDATION — OFFICIAL LOGO & SEAL
// Rooted in Identity. Driven by Purpose.
// Janakpur Dham, Nepal
// Palette: Deep Maroon, Saffron, Antique Heritage Gold, Crisp White, Warm Ivory
// ============================================================================

export function OriginFoundationLogo({
  variant = "full",
  theme = "light",
  className = "",
}: {
  variant?: "full" | "mark" | "stacked" | "inline";
  theme?: "light" | "dark"; // "light" = for dark navy background; "dark" = for light background
  className?: string;
}) {
  const isLight = theme === "light";
  const primaryTextColor = isLight ? "var(--color-brand-white, #FFFFFF)" : "var(--color-brand-text, #292524)";
  const secondaryTextColor = isLight ? "var(--color-brand-gold, #B89150)" : "var(--color-brand-primary, #7F1D2D)";
  const subtextColor = isLight ? "var(--color-brand-surface-subtle, #F7F1E5)" : "var(--color-brand-text-muted, #78716C)";
  const goldColor = "var(--color-brand-gold, #B89150)";
  const navyColor = "var(--color-brand-primary, #7F1D2D)";

  // The Emblem Mark: Sacred Lotus + Rising Sun of Janakpur + Geometric 'O' of Origin
  const EmblemMark = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
    >
      {/* Outer concentric hairline ring */}
      <circle cx="50" cy="50" r="47" stroke={goldColor} strokeWidth="1.2" opacity="0.9" />
      <circle cx="50" cy="50" r="43" stroke={goldColor} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />

      {/* Deep Navy Medallion Background */}
      <circle cx="50" cy="50" r="41" fill={navyColor} />

      {/* Sun Ray Accents (Surya of Janakpur) */}
      <g stroke={goldColor} strokeWidth="1" strokeLinecap="round" opacity="0.95">
        <line x1="50" y1="13" x2="50" y2="17" />
        <line x1="50" y1="83" x2="50" y2="87" />
        <line x1="13" y1="50" x2="17" y2="50" />
        <line x1="83" y1="50" x2="87" y2="50" />
        <line x1="24" y1="24" x2="27" y2="27" />
        <line x1="73" y1="73" x2="76" y2="76" />
        <line x1="76" y1="24" x2="73" y2="27" />
        <line x1="27" y1="73" x2="24" y2="76" />
      </g>

      {/* The Iconic 'O' Outer Rim */}
      <circle cx="50" cy="50" r="26" stroke={goldColor} strokeWidth="2.5" />

      {/* Sacred Central Lotus Petal (Kamal) */}
      <path
        d="M50 28 C45 36 43 45 50 56 C57 45 55 36 50 28 Z"
        fill={goldColor}
      />
      {/* Left Lotus Petal */}
      <path
        d="M50 56 C40 50 34 44 36 37 C42 36 47 44 50 56 Z"
        fill={goldColor}
        opacity="0.85"
      />
      {/* Right Lotus Petal */}
      <path
        d="M50 56 C60 50 66 44 64 37 C58 36 53 44 50 56 Z"
        fill={goldColor}
        opacity="0.85"
      />

      {/* Center Rising Sun Core */}
      <circle cx="50" cy="62" r="3.5" fill="#F5F0E6" />
      <path d="M42 68 Q50 65 58 68" stroke={goldColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  if (variant === "mark") {
    return <div className={`relative inline-block ${className}`}>{EmblemMark}</div>;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <div className="w-14 h-14 shrink-0">{EmblemMark}</div>
        <div className="flex flex-col items-center">
          <span
            className="text-base sm:text-lg font-bold font-serif tracking-[0.1em] uppercase leading-tight"
            style={{ color: primaryTextColor }}
          >
            The Origin Foundation
          </span>
          <span
            className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase mt-0.5"
            style={{ color: secondaryTextColor }}
          >
            Janakpur Dham &bull; Nepal
          </span>
          <span
            className="text-[11px] font-serif italic mt-1"
            style={{ color: subtextColor }}
          >
            Rooted in Identity. Driven by Purpose.
          </span>
        </div>
      </div>
    );
  }

  // Full / Inline Variant
  return (
    <div className={`flex items-center gap-3.5 group select-none ${className}`}>
      <div className="w-11 h-11 shrink-0 transition-transform group-hover:scale-[1.02] duration-150">
        {EmblemMark}
      </div>
      <div className="flex flex-col justify-center">
        <span
          className="text-base sm:text-lg font-bold font-serif tracking-[0.06em] uppercase leading-none"
          style={{ color: primaryTextColor }}
        >
          The Origin Foundation
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[9.5px] font-sans font-semibold tracking-[0.18em] uppercase"
            style={{ color: secondaryTextColor }}
          >
            Janakpur Dham &bull; Nepal
          </span>
          <span className="text-[10px] opacity-40" style={{ color: subtextColor }}>
            &bull;
          </span>
          <span
            className="text-[10.5px] font-serif italic hidden lg:inline"
            style={{ color: subtextColor }}
          >
            Rooted in Identity. Driven by Purpose.
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MITHILA QUEEN — FLAGSHIP COMPETITION IDENTITY
// Celebrating Mithila's Culture, Confidence & Talent
// ============================================================================

export function MithilaQueenLogo({
  variant = "full",
  theme = "light",
  className = "",
}: {
  variant?: "full" | "crest" | "stacked" | "badge";
  theme?: "light" | "dark";
  className?: string;
}) {
  const isLight = theme === "light";
  const primaryTextColor = isLight ? "var(--color-brand-white, #FFFFFF)" : "var(--color-brand-text, #292524)";
  const goldColor = "var(--color-brand-gold, #B89150)";
  const terracottaColor = "var(--color-brand-accent, #D97706)";
  const navyColor = "var(--color-brand-primary, #7F1D2D)";
  const subtextColor = isLight ? "var(--color-brand-surface-subtle, #F7F1E5)" : "var(--color-brand-text-muted, #78716C)";

  // The Royal Mithila Queen Crest: Regal Crown + Traditional Mayur Flourish
  const CrestMark = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
    >
      {/* Outer Hexagonal Shield with Fine Border */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="16"
        stroke={goldColor}
        strokeWidth="1.2"
        opacity="0.9"
      />
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="12"
        stroke={goldColor}
        strokeWidth="0.8"
        strokeDasharray="2 2"
        opacity="0.5"
      />

      {/* Deep Maroon Fill */}
      <rect x="12" y="12" width="76" height="76" rx="10" fill={navyColor} />

      {/* Regal Mithila Crown */}
      <path
        d="M26 58 L28 35 L40 46 L50 24 L60 46 L72 35 L74 58 Z"
        fill={goldColor}
      />
      {/* Crown Base Band with Gold Insets */}
      <rect x="25" y="58" width="50" height="7" rx="1" fill={navyColor} stroke={goldColor} strokeWidth="1" />
      <circle cx="34" cy="61.5" r="1.6" fill="#FFFFFF" />
      <circle cx="50" cy="61.5" r="2" fill={goldColor} />
      <circle cx="66" cy="61.5" r="1.6" fill="#FFFFFF" />

      {/* Crown Tip Pearls */}
      <circle cx="28" cy="34" r="2" fill="#FFFFFF" />
      <circle cx="40" cy="45" r="1.5" fill="#FFFFFF" />
      <circle cx="50" cy="23" r="2.8" fill="#FFFFFF" />
      <circle cx="60" cy="45" r="1.5" fill="#FFFFFF" />
      <circle cx="72" cy="34" r="2" fill="#FFFFFF" />

      {/* Twin Mayur (Peacock) Flourishes under crown */}
      <path
        d="M24 72 C32 66 40 70 50 74 C60 70 68 66 76 72"
        stroke={goldColor}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="50" cy="74" r="2" fill={goldColor} />
      <path
        d="M32 78 Q50 82 68 78"
        stroke={goldColor}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );

  if (variant === "crest") {
    return <div className={`relative inline-block ${className}`}>{CrestMark}</div>;
  }

  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-antique-gold/40 bg-maroon text-white select-none ${className}`}
      >
        <div className="w-5 h-5 shrink-0">{CrestMark}</div>
        <span className="text-xs font-serif font-bold tracking-wider text-white uppercase">
          Mithila Queen
        </span>
        <span className="text-[10px] text-antique-gold font-sans font-semibold tracking-wide">
          2026
        </span>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <div className="w-16 h-16 shrink-0">{CrestMark}</div>
        <div className="flex flex-col items-center">
          <span
            className="text-2xl font-black font-serif tracking-[0.08em] uppercase"
            style={{ color: primaryTextColor }}
          >
            Mithila Queen
          </span>
          <span
            className="text-xs font-serif italic text-saffron mt-0.5"
          >
            Celebrating Mithila&apos;s Culture, Confidence & Talent
          </span>
          <span
            className="text-[9.5px] font-sans font-semibold tracking-[0.18em] uppercase mt-1 opacity-80"
            style={{ color: subtextColor }}
          >
            The Origin Foundation &bull; Janakpur Dham
          </span>
        </div>
      </div>
    );
  }

  // Full / Horizontal
  return (
    <div className={`flex items-center gap-3.5 group select-none ${className}`}>
      <div className="w-12 h-12 shrink-0 transition-transform group-hover:scale-[1.02] duration-150">
        {CrestMark}
      </div>
      <div className="flex flex-col justify-center">
        <span
          className="text-lg sm:text-xl font-black font-serif tracking-[0.06em] uppercase leading-tight"
          style={{ color: primaryTextColor }}
        >
          Mithila Queen
        </span>
        <span
          className="text-[11px] font-serif italic text-saffron leading-tight mt-0.5"
        >
          Culture &bull; Confidence &bull; Talent
        </span>
        <span
          className="text-[9px] font-sans font-semibold tracking-[0.16em] uppercase mt-0.5 opacity-80"
          style={{ color: subtextColor }}
        >
          The Origin Foundation Flagship
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// AUTHENTIC MITHILA ART HERITAGE MANDALA / CANVAS
// Lotus (Kamal), Auspicious Fish (Matsya), Surya (Sun), Geometric Borders
// Flat vector strokes, no gradients
// ============================================================================

export function MithilaHeritageMandala({
  className = "w-72 h-72",
  accent = "var(--color-brand-gold, #B89150)",
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      {/* Outer Fine Geometric Border (Aripan / Kohbar inspired) */}
      <circle cx="150" cy="150" r="142" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <circle cx="150" cy="150" r="136" stroke={accent} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="150" cy="150" r="128" stroke={accent} strokeWidth="1" opacity="0.3" />

      {/* 16 Radiating Rays / Sun Energy */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        const rad = (angle * Math.PI) / 180;
        const x1 = 150 + 130 * Math.cos(rad);
        const y1 = 150 + 130 * Math.sin(rad);
        const x2 = 150 + 140 * Math.cos(rad);
        const y2 = 150 + 140 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accent}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.75"
          />
        );
      })}

      {/* 8 Sacred Lotus Petals (Kamal Ring) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        return (
          <g key={i} transform={`rotate(${angle} 150 150)`}>
            <path
              d="M150 55 C135 85 138 108 150 120 C162 108 165 85 150 55 Z"
              stroke={accent}
              strokeWidth="1.5"
              fill={accent}
              fillOpacity="0.06"
            />
            {/* Fine internal hatched lines - authentic Madhubani style */}
            <line x1="150" y1="62" x2="150" y2="112" stroke={accent} strokeWidth="0.8" opacity="0.6" />
            <line x1="145" y1="80" x2="155" y2="80" stroke={accent} strokeWidth="0.6" opacity="0.5" />
            <line x1="143" y1="92" x2="157" y2="92" stroke={accent} strokeWidth="0.6" opacity="0.5" />
          </g>
        );
      })}

      {/* Middle Concentric Ring */}
      <circle cx="150" cy="150" r="58" stroke={accent} strokeWidth="1.5" opacity="0.5" />
      <circle cx="150" cy="150" r="52" stroke={accent} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />

      {/* 4 Auspicious Mithila Fish (Matsya - prosperity & good fortune) */}
      {[0, 90, 180, 270].map((angle, i) => (
        <g key={i} transform={`rotate(${angle} 150 150)`}>
          <path
            d="M150 102 C138 106 132 116 138 126 C144 132 156 132 162 126 C168 116 162 106 150 102 Z"
            stroke={accent}
            strokeWidth="1.2"
            fill={accent}
            fillOpacity="0.1"
          />
          <path d="M150 102 L144 94 L156 94 Z" fill={accent} opacity="0.8" />
          <circle cx="150" cy="122" r="1.5" fill={accent} />
        </g>
      ))}

      {/* Central Radiant Sun Core */}
      <circle cx="150" cy="150" r="22" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.5" />
      <circle cx="150" cy="150" r="8" fill={accent} />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        const rad = (angle * Math.PI) / 180;
        const x1 = 150 + 12 * Math.cos(rad);
        const y1 = 150 + 12 * Math.sin(rad);
        const x2 = 150 + 18 * Math.cos(rad);
        const y2 = 150 + 18 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
