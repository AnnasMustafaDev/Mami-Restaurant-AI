export type SofiaExpression = 'idle' | 'listening' | 'thinking' | 'speaking' | 'recommending';

interface SofiaAvatarProps {
  expression: SofiaExpression;
  size?: number;
  className?: string;
}

export default function SofiaAvatar({ expression, size = 48, className = '' }: SofiaAvatarProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`sofia-avatar sofia-expr-${expression} ${className}`}
      aria-label={`Sofia — ${expression}`}
      role="img"
    >
      {/* Background */}
      <circle cx="40" cy="40" r="40" fill="#F5E4E7" />

      {/* Hair — back layer */}
      <ellipse cx="40" cy="27" rx="21" ry="22" fill="#2E1B0E" />
      <path d="M19 35 Q16 53 20 65 Q27 74 40 75 Q53 74 60 65 Q64 53 61 35" fill="#2E1B0E" />

      {/* Neck */}
      <rect x="34" y="62" width="12" height="11" rx="4" fill="#EFAB88" />

      {/* Ears — rendered before face so face oval overlaps inner ear */}
      <ellipse cx="22" cy="44" rx="3.5" ry="4.5" fill="#EBA882" />
      <ellipse cx="58" cy="44" rx="3.5" ry="4.5" fill="#EBA882" />

      {/* Face */}
      <ellipse cx="40" cy="44" rx="18" ry="21" fill="#F4C09A" />

      {/* Hair — front top overlay (creates hairline) */}
      <ellipse cx="40" cy="22" rx="21" ry="14" fill="#2E1B0E" />
      {/* Side hair strands */}
      <path d="M19 35 Q17 42 19 50" stroke="#2E1B0E" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M61 35 Q63 42 61 50" stroke="#2E1B0E" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Cheek blush */}
      <ellipse cx="26" cy="51" rx="5" ry="3" fill="#E07070" opacity="0.18" />
      <ellipse cx="54" cy="51" rx="5" ry="3" fill="#E07070" opacity="0.18" />

      {/* === EYEBROWS === */}
      <path
        className="eyebrow-l"
        d="M25.5 36.5 Q29.5 33.5 34 35.5"
        stroke="#2E1B0E" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {/* Normal right eyebrow */}
      <path
        className="eyebrow-r"
        d="M46 35.5 Q50.5 33.5 54.5 36.5"
        stroke="#2E1B0E" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {/* Raised right eyebrow — recommending only */}
      <path
        className="eyebrow-r-raised"
        d="M46 32.5 Q50.5 29 54.5 33"
        stroke="#2E1B0E" strokeWidth="2" fill="none" strokeLinecap="round"
      />

      {/* === LEFT EYE === */}
      <g className="eye-l">
        <ellipse cx="30" cy="41" rx="5" ry="3.5" fill="white" />
        <circle cx="30" cy="41" r="2.4" fill="#6B3D28" className="iris-l" />
        <circle cx="30" cy="41" r="1.3" fill="#140804" className="pupil-l" />
        <circle cx="31.4" cy="39.8" r="0.9" fill="white" />
        {/* Top eyelid line */}
        <path d="M25 40.2 Q30 37 35 40.2" stroke="#1A0A06" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>

      {/* === RIGHT EYE === */}
      <g className="eye-r">
        <ellipse cx="50" cy="41" rx="5" ry="3.5" fill="white" />
        <circle cx="50" cy="41" r="2.4" fill="#6B3D28" className="iris-r" />
        <circle cx="50" cy="41" r="1.3" fill="#140804" className="pupil-r" />
        <circle cx="51.4" cy="39.8" r="0.9" fill="white" />
        {/* Top eyelid line */}
        <path d="M45 40.2 Q50 37 55 40.2" stroke="#1A0A06" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>

      {/* Wink right — recommending only (replaces right eye) */}
      <path
        className="wink-r"
        d="M45 41 Q50 44.5 55 41"
        stroke="#1A0A06" strokeWidth="1.8" fill="none" strokeLinecap="round"
      />

      {/* Nose */}
      <path d="M38.5 47 Q40 50 41.5 47" stroke="#C87A60" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="37.8" cy="48.5" r="1" fill="#C87A60" opacity="0.4" />
      <circle cx="42.2" cy="48.5" r="1" fill="#C87A60" opacity="0.4" />

      {/* === MOUTHS === */}
      {/* Closed gentle smile — idle / listening */}
      <path
        className="mouth-closed"
        d="M33.5 55 Q40 59.5 46.5 55"
        stroke="#C05060" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {/* Open mouth — speaking */}
      <g className="mouth-open">
        <path d="M34 55 Q40 58 46 55" stroke="#C05060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="57" rx="5" ry="2.5" fill="#8B2030" />
        <path d="M35.5 56 Q40 58.2 44.5 56" stroke="#F0B898" strokeWidth="1" fill="none" />
      </g>
      {/* Smirk — recommending */}
      <path
        className="mouth-smirk"
        d="M33.5 55 Q38 61 46.5 54.5"
        stroke="#C05060" strokeWidth="2" fill="none" strokeLinecap="round"
      />

      {/* === WINE GLASS — recommending only === */}
      <g className="wine-glass-icon">
        <path d="M63 5 L59.5 13 Q58.5 17 61.5 18.5 L64.5 18.5 Q67.5 17 66.5 13 Z" fill="#722F37" opacity="0.9" />
        <line x1="63" y1="18.5" x2="63" y2="24" stroke="#722F37" strokeWidth="1.5" opacity="0.9" />
        <path d="M60 24 L66 24" stroke="#722F37" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <ellipse cx="63" cy="16.5" rx="2.5" ry="1.2" fill="#C05060" opacity="0.65" />
      </g>

      {/* === THINKING DOTS — thinking only === */}
      <g className="thinking-dots">
        <circle cx="57" cy="16" r="3" fill="#722F37" className="think-d1" />
        <circle cx="64.5" cy="10" r="2.4" fill="#722F37" className="think-d2" />
        <circle cx="71" cy="5.5" r="1.9" fill="#722F37" className="think-d3" />
      </g>

      {/* Earrings */}
      <circle cx="22" cy="48" r="1.3" fill="#C9A96E" />
      <circle cx="58" cy="48" r="1.3" fill="#C9A96E" />
    </svg>
  );
}
