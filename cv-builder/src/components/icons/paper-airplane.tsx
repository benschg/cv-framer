// Paper airplane SVG component - pointing to the right for horizontal/diagonal flight
export function PaperAirplane({ color, className }: { color: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main body - pointing right */}
      <path
        d="M60 32L12 56L20 32L12 8L60 32Z"
        fill={color}
        fillOpacity="0.9"
      />
      {/* Center fold line for depth */}
      <path
        d="M60 32L20 32"
        stroke="white"
        strokeOpacity="0.4"
        strokeWidth="2"
      />
      {/* Bottom wing shadow */}
      <path
        d="M60 32L12 56L20 32Z"
        fill={color}
        fillOpacity="0.6"
      />
    </svg>
  );
}
