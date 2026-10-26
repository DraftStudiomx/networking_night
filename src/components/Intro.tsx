"use client";

import { useEffect, useRef } from "react";
import s from "./Intro.module.css";

const KEY = "nn-intro-seen";

// Runs before the overlay is parsed (no flash): plays the intro on the first visit of the
// session and skips it on reloads, on returns from checkout and under reduced motion.
const decide = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="skip"}else{sessionStorage.setItem("${KEY}","1");d.dataset.intro="play"}}catch(e){d.dataset.intro="play"}})();`;

/**
 * Opening curtain: the black and red rings draw themselves, slide together and interlock,
 * the title rises beneath them, then the whole curtain lifts to reveal the invitation.
 * Pattern (full-screen gate + lift reveal, SVG line drawing) taken from 21st.dev preloaders;
 * the animation itself is CSS, so it plays and lifts even before scripts load.
 */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => el.remove();
    el.addEventListener("animationend", (e) => e.target === el && done());
    // tap or key skips straight to the page
    const skip = () => el.classList.add(s.skip);
    el.addEventListener("click", skip);
    window.addEventListener("keydown", skip, { once: true });
    return () => window.removeEventListener("keydown", skip);
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
      <div ref={ref} className={s.curtain} aria-hidden="true">
        <div className={s.stage}>
          <svg className={s.rings} viewBox="0 0 220 120">
            <circle className={s.ringA} cx="84" cy="60" r="44" pathLength={1} />
            <circle className={s.ringB} cx="136" cy="60" r="44" pathLength={1} />
          </svg>
          <p className={`${s.title} display`}>Networking Night</p>
          <p className={s.sub}>
            <span>Wedding fake</span>
          </p>
        </div>
        <span className={s.edge} />
      </div>
    </>
  );
}
