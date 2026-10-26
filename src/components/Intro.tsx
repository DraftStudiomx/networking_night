"use client";

import { useEffect, useRef, useState } from "react";
import s from "./Intro.module.css";

const KEY = "nn-intro-seen";

// Runs before the overlay is parsed (no flash): plays the intro only on a visitor's first
// visit on this device (localStorage, so new tabs and reopened links skip it too) and
// never under reduced motion. If storage is blocked it skips rather than replaying.
const decide = `(function(){var d=document.documentElement;try{if(localStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="skip"}else{localStorage.setItem("${KEY}","1");d.dataset.intro="play"}}catch(e){d.dataset.intro="skip"}})();`;

/**
 * Opening curtain: the black and red rings draw themselves, slide together and interlock,
 * the title rises beneath them, then the whole curtain lifts to reveal the invitation.
 * Pattern (full-screen gate + lift reveal, SVG line drawing) taken from 21st.dev preloaders;
 * the animation itself is CSS, so it plays and lifts even before scripts load.
 */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // unmount through React: removing the node by hand makes React's own removal crash
    // when the visitor navigates away (client-side) from the home page
    el.addEventListener("animationend", (e) => e.target === el && setDone(true));
    // tap or key skips straight to the page
    const skip = () => el.classList.add(s.skip);
    el.addEventListener("click", skip);
    window.addEventListener("keydown", skip, { once: true });
    return () => window.removeEventListener("keydown", skip);
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decide }} />
      {!done && (
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
      )}
    </>
  );
}
