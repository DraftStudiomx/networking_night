"use client";

import ErrorPage from "./error";
import "./globals.css";

// Errors in the root layout itself; renders its own <html> because the layout is gone.
export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es-MX">
      <body>
        <ErrorPage {...props} />
      </body>
    </html>
  );
}
