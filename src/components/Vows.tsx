"use client";

import { motion, useReducedMotion } from "motion/react";
import s from "./Vows.module.css";

/**
 * The couple's signature moment: two large rings start apart, draw themselves in
 * and slide together until they interlock as the section comes into view.
 */
export function Vows() {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;
  const ring = (cx: number, from: number, color: string, delay: number) => (
    <motion.circle
      cx={cx}
      cy={60}
      r={44}
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      initial={reduce ? false : { x: from, pathLength: 0 }}
      whileInView={{ x: 0, pathLength: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ x: { duration: 1.4, ease, delay: delay + 0.5 }, pathLength: { duration: 1.1, ease, delay } }}
    />
  );
  return (
    <svg className={s.rings} viewBox="0 0 220 120" aria-hidden="true">
      {ring(84, -34, "var(--ink)", 0)}
      {ring(136, 34, "var(--red)", 0.15)}
    </svg>
  );
}
