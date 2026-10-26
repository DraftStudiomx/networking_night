import type { CSSProperties } from "react";

/**
 * Splits a line into letters that rise out of a mask on load. Pure CSS (no JS), so the
 * text is server-rendered and still shows if scripts fail; screen readers get the whole word.
 */
export function RevealText({ text, delay = 0, step = 45, className }: { text: string; delay?: number; step?: number; className?: string }) {
  return (
    <span className={`reveal ${className ?? ""}`}>
      <span className="visually-hidden">{text}</span>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="reveal__mask" aria-hidden="true">
          <span className="reveal__ch" style={{ "--d": `${delay + i * step}ms` } as CSSProperties}>
            {ch === " " ? " " : ch}
          </span>
        </span>
      ))}
    </span>
  );
}
