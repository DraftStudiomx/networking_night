// Authored brand marks: BNI wordmark, P&M monogram seal, interlocked rings.
import { DRAFT_STUDIO } from "@/lib/draftstudio";

type SvgProps = { className?: string; title?: string };

/** BNI wordmark redrawn as paths from the chapter logos in Assets/. */
export function BniWordmark({ className, title = "BNI" }: SvgProps) {
  return (
    <svg className={className} viewBox="120 165 885 366" role="img" aria-label={title}>
      <g fill="var(--red)">
        <path
          fillRule="evenodd"
          d="M125 170H330C400 170 430 212 430 263C430 300 410 326 375 338C420 351 448 386 448 430C448 487 408 526 330 526H125ZM233 251V309H290C310 309 322 297 322 280C322 263 310 251 290 251ZM233 386V446H300C325 446 338 432 338 416C338 400 325 386 300 386Z"
        />
        <path d="M486 170H596L737 350V170H845V526H745L594 333V526H486Z" />
        <path d="M891 170H1000L891 279Z" />
        <path d="M1000 212V526H891V321Z" />
      </g>
    </svg>
  );
}

/** Wedding monogram seal: P and M split by a hairline diagonal, red ampersand at the seam. */
export function Monogram({ className, title = "Pioneros y Metamorfosis" }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 44 44" role="img" aria-label={title}>
      <circle cx="22" cy="22" r="20.5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="17" fill="none" stroke="var(--ink)" strokeWidth=".6" />
      <line x1="12" y1="32" x2="32" y2="12" stroke="var(--ink)" strokeWidth=".6" />
      <circle cx="22" cy="22" r="4.6" fill="var(--ground)" />
      <text x="15.5" y="22" className="mono-letter" fontSize="14" textAnchor="middle" fill="var(--ink)">P</text>
      <text x="28.5" y="33" className="mono-letter" fontSize="14" textAnchor="middle" fill="var(--ink)">M</text>
      <text x="22" y="25.2" className="mono-letter" fontSize="8.5" textAnchor="middle" fill="var(--red)">&amp;</text>
    </svg>
  );
}

/** Two interlocked rings: black for Pioneros, red for Metamorfosis (or both in one colour). */
export function Rings({ className, mono }: SvgProps & { mono?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 18" aria-hidden="true">
      <circle cx="10.5" cy="9" r="7" fill="none" stroke={mono ?? "var(--ink)"} strokeWidth="1.4" />
      <circle cx="19.5" cy="9" r="7" fill="none" stroke={mono ?? "var(--red)"} strokeWidth="1.4" />
    </svg>
  );
}

/** Chapter lockup: BNI wordmark over the chapter name, as in the official chapter logos. */
export function ChapterLogo({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`chapter-logo ${className ?? ""}`}>
      <BniWordmark className="chapter-logo__mark" title={`BNI ${name}`} />
      <span className="chapter-logo__name" aria-hidden="true">{name}</span>
    </span>
  );
}

/** Draft Studio logo (the studio that built the site), in the current text colour. */
export function DraftStudioLogo({ className, title = DRAFT_STUDIO.name }: SvgProps) {
  return (
    <svg className={className} viewBox={DRAFT_STUDIO.viewBox} role="img" aria-label={title}>
      <g fill="none" stroke="currentColor" strokeLinecap="square">
        {DRAFT_STUDIO.corners.map((d) => (
          <path key={d} d={d} strokeWidth="2.2" />
        ))}
        <path d={DRAFT_STUDIO.mark} strokeWidth="2.6" />
      </g>
      <path d={DRAFT_STUDIO.wordmark} fill="currentColor" />
    </svg>
  );
}
