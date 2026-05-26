type LogoProps = {
  /** Size of the square logo mark in px. */
  size?: number;
  /** Font size of the "VedaAI" wordmark in px. */
  textSize?: number;
};

/**
 * Orange tile + bold glossy white "v", drawn as crisp vector.
 * The mark follows the Figma "v": two overlapping halves (left = shaded fold,
 * right = bright white) forming a chunky lowercase v with wide flat tops, a
 * centre notch and a rounded bottom. Region x 6→34, y 11→30.4 in the 40px tile.
 */
function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      role="img"
      aria-label="VedaAI"
    >
      <defs>
        {/* Tile: vivid orange top → deep maroon bottom (slightly toward bottom-left). */}
        <linearGradient id="veda-tile" x1="25" y1="1" x2="12" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F18A2C" />
          <stop offset="0.5" stopColor="#C24A20" />
          <stop offset="1" stopColor="#5A1810" />
        </linearGradient>
        {/* White body of the "v" with a faint top→bottom tone. */}
        <linearGradient id="veda-v" x1="20" y1="11" x2="20" y2="30.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#ECE7E2" />
        </linearGradient>
        {/* Fold shadow on the left half. */}
        <linearGradient id="veda-fold" x1="13" y1="12" x2="20" y2="30.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E1513" stopOpacity="0" />
          <stop offset="0.5" stopColor="#0E1513" stopOpacity="0.04" />
          <stop offset="1" stopColor="#0E1513" stopOpacity="0.32" />
        </linearGradient>
        <filter id="veda-v-shadow" x="-20%" y="-15%" width="140%" height="150%">
          <feDropShadow dx="0" dy="1.3" stdDeviation="1.1" floodColor="#3A0E08" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect width="40" height="40" rx="10" fill="url(#veda-tile)" />
      {/* Glossy top sheen */}
      <rect width="40" height="20" rx="10" fill="#FFFFFF" fillOpacity="0.08" />

      <g filter="url(#veda-v-shadow)">
        {/* Full "v": wide flat tops, centre notch, rounded chunky bottom. */}
        <path
          d="M6 11 L14.5 11 L20 20.5 L25.5 11 L34 11 L21.3 30 Q20 31.5 18.7 30 Z"
          fill="url(#veda-v)"
        />
        {/* Left half fold shading */}
        <path d="M6 11 L14.5 11 L20 20.5 L20 31 L18.7 30 Z" fill="url(#veda-fold)" />
      </g>
    </svg>
  );
}

/**
 * VedaAI brand lockup: vector "v" mark + wordmark, vertically centred on one line.
 * Wordmark is Bricolage Grotesque 700 with tight -0.06em tracking (per Figma).
 */
export default function Logo({ size = 40, textSize = 28 }: LogoProps) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <LogoMark size={size} />
      <span
        style={{
          fontFamily: "var(--font-bricolage)",
          fontWeight: 700,
          fontSize: `${textSize}px`,
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: "#303030",
        }}
      >
        VedaAI
      </span>
    </div>
  );
}
