export function CVBuilderLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
    >
      <defs>
        <linearGradient id="paper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff' }} />
          <stop offset="100%" style={{ stopColor: '#f1f5f9' }} />
        </linearGradient>
      </defs>

      {/* Document/CV icon */}
      <g transform="translate(56, 24)">
        {/* Paper shadow */}
        <rect x="8" y="8" width="320" height="440" rx="20" fill="#94a3b8" opacity="0.3" />

        {/* Paper background */}
        <rect x="0" y="0" width="320" height="440" rx="20" fill="url(#paper)" />

        {/* Folded corner */}
        <path d="M320 0 L320 70 Q320 80 310 80 L250 80 L320 0" fill="#e2e8f0" />
        <path d="M250 0 L320 0 L320 70 Q320 80 310 80 L250 80 L250 10 Q250 0 260 0" fill="#cbd5e1" />

        {/* Profile circle */}
        <circle cx="160" cy="100" r="50" fill="#3b82f6" />
        <circle cx="160" cy="90" r="20" fill="#bfdbfe" />
        <ellipse cx="160" cy="130" rx="30" ry="20" fill="#bfdbfe" />

        {/* Name line */}
        <rect x="60" y="175" width="200" height="16" rx="8" fill="#1e40af" />

        {/* Subtitle */}
        <rect x="90" y="200" width="140" height="10" rx="5" fill="#60a5fa" />

        {/* Section header */}
        <rect x="40" y="240" width="80" height="10" rx="5" fill="#3b82f6" />

        {/* Content lines */}
        <rect x="40" y="265" width="240" height="8" rx="4" fill="#cbd5e1" />
        <rect x="40" y="285" width="220" height="8" rx="4" fill="#cbd5e1" />
        <rect x="40" y="305" width="200" height="8" rx="4" fill="#cbd5e1" />

        {/* Section header 2 */}
        <rect x="40" y="340" width="100" height="10" rx="5" fill="#3b82f6" />

        {/* More content lines */}
        <rect x="40" y="365" width="240" height="8" rx="4" fill="#cbd5e1" />
        <rect x="40" y="385" width="180" height="8" rx="4" fill="#cbd5e1" />
        <rect x="40" y="405" width="210" height="8" rx="4" fill="#cbd5e1" />
      </g>

      {/* AI sparkle accent */}
      <g transform="translate(340, 340)">
        <circle cx="50" cy="50" r="55" fill="#fbbf24" />
        {/* 5-point star */}
        <polygon points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35" fill="white" />
      </g>
    </svg>
  );
}
