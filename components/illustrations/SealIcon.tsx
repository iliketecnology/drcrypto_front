/** Selo / stamp circular pra "100% PIX Bacen" — sensação de carimbo institucional. */

export function SealIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-16"
      role="img"
      aria-label="Selo Bacen"
    >
      <defs>
        <linearGradient id="opr-seal-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-green-500)" />
          <stop offset="100%" stopColor="var(--color-green-700)" />
        </linearGradient>
      </defs>

      {/* Anel externo serrilhado */}
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke="var(--color-green-700)"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        opacity="0.5"
      />

      {/* Disco interno */}
      <circle cx="40" cy="40" r="30" fill="url(#opr-seal-fill)" />

      {/* Texto curvado decorativo (em path) */}
      <g fill="white" opacity="0.9">
        {/* Estrela central */}
        <path d="M 40 22 L 43 32 L 53 32 L 45 38 L 48 48 L 40 42 L 32 48 L 35 38 L 27 32 L 37 32 Z" />
      </g>

      {/* Texto BACEN */}
      <text
        x="40"
        y="62"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        fill="white"
        letterSpacing="1.5"
        fontFamily="var(--font-sans)"
      >
        BACEN
      </text>
    </svg>
  );
}
