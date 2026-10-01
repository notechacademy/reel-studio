import React from "react";
import { C, F, UPPER } from "./theme";

export const Icon: React.FC<{ name: string; size?: number; color?: string; fill?: string; stroke?: number }> = ({
  name, size = 40, color = C.ink, fill = "none", stroke = 2.4,
}) => {
  const p: Record<string, React.ReactNode> = {
    eye: (<><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
    heart: <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />,
    bubble: <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20.5l1.5-5.2A8.5 8.5 0 1 1 21 11.5Z" />,
    plane: (<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></>),
    check: <path d="M4 12.5 9.5 18 20 6.5" />,
    x: (<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>),
    lock: (<><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>),
    play: <path d="M7 4.5v15l13-7.5-13-7.5Z" />,
    bookmark: <path d="M6 3.5h12v17l-6-4.5-6 4.5v-17Z" />,
    search: (<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>),
    user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" /></>),
    bell: (<><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
    cart: (<><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.5 12h12L22 7H6.2" /></>),
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
    clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
    euro: (<><path d="M17 6.5A7 7 0 1 0 17 17.5" /><path d="M4 10h9M4 14h9" /></>),
    home: (<><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>),
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />,
    target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>),
    chart: (<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>),
    leaf: <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15Zm0 0 7-7" />,
    calendar: (<><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
    phone: (<><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>),
    gift: (<><rect x="3.5" y="9" width="17" height="11" rx="1.5" /><path d="M2.5 9h19M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9Zm0 0c2-4 6-4 6-1.5S14 9 12 9Z" /></>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      {p[name]}
    </svg>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; border?: string; size?: number; style?: React.CSSProperties }> = ({
  children, bg = C.accent, color = "#fff", border, size = 24, style,
}) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 10, background: bg, color, border: border ? `3px solid ${border}` : undefined,
    borderRadius: 999, padding: `${size * 0.5}px ${size * 0.95}px`, fontFamily: F.body, fontWeight: 800, fontSize: size,
    letterSpacing: size * 0.14, lineHeight: 1, whiteSpace: "nowrap", ...style,
  }}>{children}</div>
);

// Display title following the brand rules. parts: [text, style]
//   n = normal | p = accent text | b = accent block (white text) | dot = accent full stop
export type Part = [string, "n" | "p" | "b" | "dot"];
export const Title: React.FC<{ lines: Part[][]; size: number; color?: string; style?: React.CSSProperties; blockProgress?: number }> = ({
  lines, size, color = C.ink, style, blockProgress = 1,
}) => (
  <div style={{ fontFamily: F.display, fontSize: size, lineHeight: 1.02, color, textTransform: UPPER, ...style }}>
    {lines.map((ln, i) => (
      <div key={i} style={{ whiteSpace: "nowrap" }}>
        {ln.map(([t, s], j) =>
          s === "b" ? (
            <span key={j} style={{ position: "relative", display: "inline-block", padding: `0 ${size * 0.1}px`, color: blockProgress > 0.5 ? "#fff" : color }}>
              <span style={{ position: "absolute", left: 0, top: size * 0.08, bottom: -size * 0.06, width: `${blockProgress * 100}%`, background: C.accent, zIndex: 0 }} />
              <span style={{ position: "relative", zIndex: 1 }}>{t}</span>
            </span>
          ) : (
            <span key={j} style={{ color: s === "p" || s === "dot" ? C.accent : color }}>{t}</span>
          ),
        )}
      </div>
    ))}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.accentDark, size = 22 }) => (
  <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: size, letterSpacing: size * 0.2, color, textTransform: "uppercase", lineHeight: 1.2 }}>{children}</div>
);

export const NumCircle: React.FC<{ n: number; size?: number; bg?: string; color?: string }> = ({ n, size = 84, bg = C.accent, color = "#fff" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontSize: size * 0.48, flexShrink: 0 }}>
    {String(n).padStart(2, "0")}
  </div>
);

export const Avatar: React.FC<{ name: string; size?: number; hue?: number }> = ({ name, size = 64, hue = 330 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `linear-gradient(135deg, hsl(${hue} 70% 72%), hsl(${(hue + 40) % 360} 65% 58%))`,
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body, fontWeight: 800, fontSize: size * 0.42,
  }}>{name[0].toUpperCase()}</div>
);

export const fmt = (n: number) => {
  if (n >= 10000) return (n / 1000).toFixed(1).replace(".", ",") + "K";
  return Math.round(n).toLocaleString("it-IT");
};
