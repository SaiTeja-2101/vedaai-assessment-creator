import Image from "next/image";

type LogoProps = {
  /** Size of the square logo mark in px. */
  size?: number;
  /** Font size of the "VedaAI" wordmark in px. */
  textSize?: number;
};

/**
 * VedaAI brand lockup: the logo mark (/public/logo.avif) + wordmark, centred on
 * one line. Wordmark is Bricolage Grotesque 700 with tight -0.06em tracking.
 */
export default function Logo({ size = 40, textSize = 28 }: LogoProps) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <Image
        src="/logo.avif"
        alt="VedaAI logo"
        width={size}
        height={size}
        priority
        className="shrink-0 rounded-[10px] object-contain"
        style={{ width: size, height: size }}
      />
      <span
        className="leading-none text-ink"
        style={{ fontFamily: "var(--font-bricolage)", fontWeight: 700, fontSize: textSize, letterSpacing: "-0.06em" }}
      >
        VedaAI
      </span>
    </div>
  );
}
