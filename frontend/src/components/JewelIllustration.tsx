/**
 * Line illustrations standing in for product photography.
 *
 * Deliberately drawn rather than stock photos: an obviously-illustrated
 * placeholder reads as "photography pending" instead of implying these are
 * real pieces from the client's stock. Swap for R2 images in P2.
 */

type Props = { category: string | null; className?: string };

function Ring() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
      <circle cx="60" cy="72" r="26" />
      <circle cx="60" cy="72" r="20" opacity="0.35" />
      <path d="M60 30 L70 44 L60 54 L50 44 Z" />
      <path d="M50 44 H70" opacity="0.5" />
      <path d="M60 30 L60 54" opacity="0.3" />
    </g>
  );
}

function Earrings() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
      <path d="M40 34 L48 46 L40 58 L32 46 Z" />
      <path d="M40 58 V70" opacity="0.5" />
      <circle cx="40" cy="78" r="8" />
      <path d="M80 34 L88 46 L80 58 L72 46 Z" />
      <path d="M80 58 V70" opacity="0.5" />
      <circle cx="80" cy="78" r="8" />
    </g>
  );
}

function Pendant() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
      <path d="M26 30 Q60 62 94 30" opacity="0.55" />
      <path d="M60 56 L72 72 L60 92 L48 72 Z" />
      <path d="M48 72 H72" opacity="0.5" />
      <circle cx="60" cy="50" r="4" />
    </g>
  );
}

function Necklace() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
      <path d="M22 26 Q60 74 98 26" opacity="0.55" />
      <path d="M60 62 L70 76 L60 92 L50 76 Z" />
      <circle cx="42" cy="56" r="4.5" />
      <circle cx="78" cy="56" r="4.5" />
      <circle cx="31" cy="44" r="3.5" opacity="0.6" />
      <circle cx="89" cy="44" r="3.5" opacity="0.6" />
    </g>
  );
}

function Generic() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
      <path d="M60 34 L82 58 L60 90 L38 58 Z" />
      <path d="M38 58 H82" opacity="0.5" />
      <path d="M60 34 L60 90" opacity="0.3" />
      <path d="M48 46 L72 46" opacity="0.3" />
    </g>
  );
}

const BY_CATEGORY: Record<string, () => React.ReactElement> = {
  rings: Ring,
  earrings: Earrings,
  jhumkas: Earrings,
  pendants: Pendant,
  "maang-tikka": Pendant,
  necklaces: Necklace,
  bangles: Ring,
  kamarbandh: Necklace,
  anklets: Ring,
};

export default function JewelIllustration({ category, className = "" }: Props) {
  const Art = (category && BY_CATEGORY[category]) || Generic;
  return (
    <div
      className={`grid place-items-center bg-linear-to-br from-cream to-gold-soft ${className}`}
    >
      <svg viewBox="0 0 120 120" className="w-1/2 max-w-[160px] text-gold/70" aria-hidden="true">
        <Art />
      </svg>
    </div>
  );
}
