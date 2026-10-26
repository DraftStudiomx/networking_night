import { googleCalendarUrl } from "@/lib/event";
import s from "./AddToCalendar.module.css";

/**
 * One button, two destinations: Google Calendar (web/Android) or the .ics file, which an
 * iPhone opens directly in Calendar and Outlook imports. Native <details>, no JS needed.
 */
export function AddToCalendar() {
  return (
    <details className={s.wrap}>
      <summary className="btn tr">Agregar al calendario</summary>
      <div className={s.menu}>
        <a href={googleCalendarUrl()} target="_blank" rel="noopener" className="tr">
          Google Calendar
        </a>
        <a href="/api/calendario" className="tr">
          iPhone · Outlook
        </a>
      </div>
    </details>
  );
}
