import { ImageResponse } from "next/og";

// Home-screen and share-sheet icon on iPhone (iOS ignores SVG icons): the two rings.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F5F1" }}>
        <svg width={170} height={170} viewBox="4 4 56 56">
          <circle cx="24.5" cy="32" r="13" fill="none" stroke="#141414" strokeWidth="4.2" />
          <circle cx="39.5" cy="32" r="13" fill="none" stroke="#C8102E" strokeWidth="4.2" />
        </svg>
      </div>
    ),
    size,
  );
}
