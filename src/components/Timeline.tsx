"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import s from "./Timeline.module.css";

type Row = { when: string; title: string; text: string };

/**
 * Story rows joined by a red thread that draws itself as you scroll; each row lights up
 * (and its ring closes) when the thread reaches it. Scroll-drawn line adapted from the
 * 21st.dev "Scroll animated timeline" (ibrandify), rebuilt on motion's useScroll.
 */
export function Timeline({ rows }: { rows: readonly Row[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const [enhanced, setEnhanced] = useState(false);
  const [reached, setReached] = useState(-1);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  useEffect(() => setEnhanced(!reduce), [reduce]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setReached(Math.floor(p * (rows.length - 1) + 0.15));
  });

  return (
    <ol ref={ref} className={s.list} data-enhanced={enhanced || undefined}>
      <span className={s.track} aria-hidden="true">
        <motion.span className={s.thread} style={{ scaleY: enhanced ? progress : 1 }} />
      </span>
      {rows.map((row, i) => (
        <li key={row.title} className={s.row} data-on={!enhanced || i <= reached || undefined}>
          <span className={s.knot} aria-hidden="true">
            <svg viewBox="0 0 30 18">
              <circle className={s.ringA} cx="10.5" cy="9" r="7" />
              <circle className={s.ringB} cx="19.5" cy="9" r="7" />
            </svg>
          </span>
          <span className={`${s.when} display num`}>{row.when}</span>
          <div className={s.copy}>
            <h3 className={`${s.title} tr`}>{row.title}</h3>
            <p>{row.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
