import { ImageResponse } from "next/og";

export const alt = "BlinkDB — in-memory database at the speed of a blink";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
          padding: 80, background: "radial-gradient(circle at 20% 0%, #2a2108 0%, #06070b 60%)", color: "#e9ecf4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#ffd23f,#ff9d2e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="42" height="42" viewBox="0 0 24 24">
              <path d="M13.5 2 4 13.5h6.2L9.5 22 20 9.8h-6.4L13.5 2Z" fill="#14110a" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>BlinkDB</div>
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, marginTop: 40, lineHeight: 1.05, letterSpacing: -2 }}>
          Databases at the speed of a blink.
        </div>
        <div style={{ fontSize: 32, color: "#8d95a9", marginTop: 28 }}>
          1.04M ops/s · 2.29x faster than DragonflyDB on batch reads · Redis-compatible
        </div>
      </div>
    ),
    size
  );
}
