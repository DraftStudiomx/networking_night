"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type ElementType } from "react";

type Props = Omit<React.AllHTMLAttributes<HTMLElement>, "as"> & {
  as?: ElementType;
  /** corner radius of the concave cut */
  radius?: number;
  /** draw the ring medallion centred on the top edge */
  medallion?: boolean;
  /** draw a perforated tear line above the element marked [data-stub] */
  tear?: boolean;
  className?: string;
  children: ReactNode;
};

type Geo = { w: number; h: number; tearY: number | null };

const outline = (W: number, H: number, o: number, R: number) =>
  `M${o + R},${o} H${W - o - R} A${R},${R} 0 0 0 ${W - o},${o + R} V${H - o - R} A${R},${R} 0 0 0 ${W - o - R},${H - o} H${o + R} A${R},${R} 0 0 0 ${o},${H - o - R} V${o + R} A${R},${R} 0 0 0 ${o + R},${o} Z`;

/**
 * Every framed surface of the site is a ticket: ground fill, concave corners,
 * double rule, optional ring medallion and tear line. The outline is drawn to
 * the element's real size so corners and notches always land true.
 */
export function Ticket({ as: Tag = "div", radius = 28, medallion, tear, className, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const stub = tear ? (el.querySelector(":scope > [data-stub]") as HTMLElement | null) : null;
      setGeo({ w: el.offsetWidth, h: el.offsetHeight, tearY: stub ? stub.offsetTop : null });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tear]);

  const R = radius;
  const inner = R > 20 ? 7 : 5;
  const notch = 9;

  return (
    <Tag ref={ref} className={`ticket ${className ?? ""}`} data-ready={geo ? "" : undefined} {...rest}>
      {geo && (
        <svg className="ticket__edge" viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
          <path d={outline(geo.w, geo.h, 0, R)} fill="var(--ground)" />
          <path className="ticket__rule" d={outline(geo.w, geo.h, 1, R)} pathLength={1} />
          <path d={outline(geo.w, geo.h, inner, R - 2)} fill="none" stroke="var(--ink)" strokeWidth=".75" />
          {medallion && (
            <g>
              <rect x={geo.w / 2 - 30} y={0} width={60} height={12} fill="var(--ground)" />
              <circle cx={geo.w / 2 - 5} cy={4} r={8} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
              <circle cx={geo.w / 2 + 5} cy={4} r={8} fill="none" stroke="var(--red)" strokeWidth="1.5" />
            </g>
          )}
          {geo.tearY !== null && (
            <g>
              <line
                x1={notch + 8}
                y1={geo.tearY}
                x2={geo.w - notch - 8}
                y2={geo.tearY}
                stroke="var(--ink)"
                strokeWidth="1"
                strokeDasharray="2 5"
              />
              <path
                d={`M0,${geo.tearY - notch} A${notch},${notch} 0 0 1 0,${geo.tearY + notch}`}
                fill="var(--page)"
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <path
                d={`M${geo.w},${geo.tearY - notch} A${notch},${notch} 0 0 0 ${geo.w},${geo.tearY + notch}`}
                fill="var(--page)"
                stroke="var(--ink)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      )}
      {children}
    </Tag>
  );
}
