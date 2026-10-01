import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, F, clamp, stepF, jit, paperShadow, hexA } from "../theme";
import { Pill } from "../ui";
import { E } from "../edit";
import { hexA as _h } from "../theme";

// ---------- shared stage for every explainer scene ----------
// grid paper in brand colours, "slap-in" entrance in 3 stepped photos, per-photo jitter
export const Paper: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill style={{
      backgroundImage: `linear-gradient(${hexA(C.ink, 0.06)} 2px, transparent 2px), linear-gradient(90deg, ${hexA(C.ink, 0.06)} 2px, transparent 2px)`,
      backgroundSize: "90px 90px",
    }} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 85% 8%, ${hexA(C.accentSoft, 0.75)}, ${hexA(C.accentSoft, 0)} 45%)` }} />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 60%, rgba(40,30,20,0.12) 100%)" }} />
  </AbsoluteFill>
);

export const DarkPaper: React.FC = () => (
  <AbsoluteFill style={{ background: C.dark }}>
    <AbsoluteFill style={{ background: `radial-gradient(circle at 15% 0%, ${C.darkGlow} 0%, ${_h(C.darkGlow, 0)} 60%)` }} />
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.035) 2px, transparent 2px)", backgroundSize: "90px 90px" }} />
  </AbsoluteFill>
);

export const Stage: React.FC<{ f: number; from: number; to: number; seed: string; tag?: string; n?: number; dark?: boolean; noBadge?: boolean; children: (lf: number) => React.ReactNode }> = ({ f, from, to, seed, tag, n, dark, noBadge, children }) => {
  if (f < from || f >= to) return null;
  const lf = f - from;
  const steps = [{ y: 1100, r: -7 }, { y: 260, r: 3 }, { y: -18, r: -0.8 }, { y: 0, r: 0 }];
  const e = steps[Math.min(steps.length - 1, Math.floor(lf / 2))];
  const j = jit(seed, lf, 0.6);
  return (
    <AbsoluteFill style={{ translate: `0px ${e.y}px`, rotate: `${e.r}deg` }}>
      {dark ? <DarkPaper /> : <Paper />}
      <AbsoluteFill style={{ translate: `${j.x}px ${j.y}px`, rotate: `${j.r * 0.4}deg` }}>
        {!noBadge && (
          <div style={{ position: "absolute", left: 70, top: 150, display: "flex", gap: 14, alignItems: "center" }}>
            {E.example_label !== "" && <Pill size={22}>{E.example_label ?? "ESEMPIO"}</Pill>}
            {tag && <Pill size={22} bg={C.surface} color={C.ink} border={C.ink}>{n !== undefined ? `${String(n).padStart(2, "0")} · ${tag}` : tag}</Pill>}
          </div>
        )}
        {children(lf)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// scene headline: Part-like mini syntax "TESTO *PAROLA*." -> accent on *word*
export const Headline: React.FC<{ text: string; top?: number; size?: number }> = ({ text, top = 230, size = 92 }) => {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  const len = text.replace(/\*/g, "").length;
  const fs = Math.min(size, Math.floor(1750 / Math.max(1, len))); // always one line
  return (
    <div style={{ position: "absolute", left: 70, right: 40, top: top + (size - fs) * 0.6, fontFamily: F.display, fontSize: fs, lineHeight: 1, color: C.ink, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {parts.map((p, i) => p.startsWith("*") ? <span key={i} style={{ color: C.accent }}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>)}
    </div>
  );
};

export const Tap: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const lf = stepF(f) - at;
  if (lf < -6 || lf > 12) return null;
  const press = lf < 0 ? interpolate(lf, [-6, 0], [0, 1], clamp) : 1;
  const ring = lf >= 0 ? interpolate(lf, [0, 12], [0.4, 1.8], clamp) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 30 }}>
      {lf >= 0 && <div style={{ position: "absolute", left: -60, top: -60, width: 120, height: 120, borderRadius: "50%", border: `6px solid ${C.accent}`, scale: `${ring}`, opacity: 1 - lf / 12 }} />}
      <div style={{ position: "absolute", left: -34, top: -34, width: 68, height: 68, borderRadius: "50%", background: hexA(C.accent, 0.35), border: "4px solid #fff", boxShadow: "0 6px 18px rgba(0,0,0,0.25)", scale: `${0.8 + 0.2 * press}`, opacity: press }} />
    </div>
  );
};

export const Phone: React.FC<{ x: number; y: number; w: number; h: number; laptop?: boolean; children: React.ReactNode }> = ({ x, y, w, h, laptop, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: laptop ? 24 : 64, background: C.ink, padding: laptop ? 14 : 16, boxShadow: paperShadow }}>
    <div style={{ width: "100%", height: "100%", borderRadius: laptop ? 10 : 50, background: "#fff", overflow: "hidden", position: "relative" }}>
      {!laptop && <div style={{ position: "absolute", left: "50%", top: 14, width: 120, height: 32, borderRadius: 20, background: C.ink, translate: "-50% 0", zIndex: 5 }} />}
      {children}
    </div>
  </div>
);
