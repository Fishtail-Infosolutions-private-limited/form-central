import React from "react";

export function MithilaMotif({ className = "w-full h-4 text-[#C5A880]/40" }: { className?: string }) {
  return (
    <div className={`overflow-hidden flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 240 16"
        fill="currentColor"
        className="w-full h-full max-w-md opacity-70"
        preserveAspectRatio="none"
      >
        <path d="M0,8 L15,0 L30,8 L15,16 Z M30,8 L45,0 L60,8 L45,16 Z M60,8 L75,0 L90,8 L75,16 Z M90,8 L105,0 L120,8 L105,16 Z M120,8 L135,0 L150,8 L135,16 Z M150,8 L165,0 L180,8 L165,16 Z M180,8 L195,0 L210,8 L195,16 Z M210,8 L225,0 L240,8 L225,16 Z" />
        <circle cx="15" cy="8" r="2" fill="#0A192F" />
        <circle cx="45" cy="8" r="2" fill="#0A192F" />
        <circle cx="75" cy="8" r="2" fill="#0A192F" />
        <circle cx="105" cy="8" r="2" fill="#0A192F" />
        <circle cx="135" cy="8" r="2" fill="#0A192F" />
        <circle cx="165" cy="8" r="2" fill="#0A192F" />
        <circle cx="195" cy="8" r="2" fill="#0A192F" />
        <circle cx="225" cy="8" r="2" fill="#0A192F" />
      </svg>
    </div>
  );
}

export function MithilaCornerMotif({ className = "w-10 h-10 text-[#C5A880]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={`select-none pointer-events-none ${className}`}>
      <path d="M4 36 V12 C4 7.57 7.57 4 12 4 H36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 30 V16 C10 12.68 12.68 10 16 10 H30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}
