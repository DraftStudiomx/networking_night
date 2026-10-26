"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const UNITS = [
  { key: "d", label: "Días", ms: 86_400_000 },
  { key: "h", label: "Horas", ms: 3_600_000 },
  { key: "m", label: "Min", ms: 60_000 },
  { key: "s", label: "Seg", ms: 1_000 },
] as const;

function split(diff: number) {
  let rest = Math.max(0, diff);
  return UNITS.map((u) => {
    const v = Math.floor(rest / u.ms);
    rest -= v * u.ms;
    return v;
  });
}

/**
 * Each digit rolls up out of a soft blur when it changes, like a card turning over.
 * Digit-roll pattern adapted from the 21st.dev "Animated Countdown" (nexus-ui).
 */
function Digit({ value }: { value: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="roll">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="roll__v"
          initial={reduce ? { opacity: 0 } : { y: "60%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { y: "-60%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: reduce ? 0.05 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Live countdown; renders dashes until mounted so server and client markup agree. */
export function Countdown({ to, className }: { to: string; className?: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now !== null && now >= target) {
    return (
      <p className={className} role="status">
        <span className="display">¡Hoy es la boda!</span>
      </p>
    );
  }

  const parts = now === null ? null : split(target - now);

  return (
    <div className={className} role="timer" aria-label="Tiempo para el evento">
      {UNITS.map((u, i) => (
        <div key={u.key}>
          <b className="display num">
            {parts ? (
              String(parts[i])
                .padStart(2, "0")
                .split("")
                .map((ch, j) => <Digit key={j} value={ch} />)
            ) : (
              <span className="roll">––</span>
            )}
          </b>
          <small className="tr">{u.label}</small>
        </div>
      ))}
    </div>
  );
}
