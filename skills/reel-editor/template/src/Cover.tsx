import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F, paperShadow, hexA } from "./theme";
import { E } from "./edit";
import { Pill, Title, Icon } from "./ui";

// Cover: brand paper background + subject cut-out (public/cover_cut.png from scripts/cutout.py) + stickers.
// Everything (texts, stickers) comes from edit.json -> cover.
const Sticker: React.FC<{ x: number; y: number; rot: number; style?: string; children: React.ReactNode }> = ({ x, y, rot, style = "light", children }) => {
  const bg = style === "accent" ? C.accent : style === "dark" ? C.dark : "#fff";
  const color = style === "light" ? C.ink : "#fff";
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, background: bg, color, borderRadius: 26, padding: "18px 26px", boxShadow: paperShadow, fontFamily: F.body, display: "flex", alignItems: "center", gap: 14, border: "5px solid #fff" }}>
      {children}
    </div>
  );
};

export const Cover: React.FC = () => {
  const c = E.cover;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${hexA(C.ink, 0.06)} 2px, transparent 2px), linear-gradient(90deg, ${hexA(C.ink, 0.06)} 2px, transparent 2px)`, backgroundSize: "90px 90px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 55% 52%, ${hexA(C.accentSoft, 0.95)} 0%, ${hexA(C.accentSoft, 0)} 48%)` }} />
      <div style={{ position: "absolute", left: 70, top: 190, display: "flex", gap: 14 }}>
        {c.pills.map((p, i) => <Pill key={i} size={26} bg={i === 0 ? C.accent : C.surface} color={i === 0 ? "#fff" : C.ink} border={i === 0 ? undefined : C.ink}>{p}</Pill>)}
      </div>
      <div style={{ position: "absolute", left: 70, top: 275 }}>
        <Title lines={c.lines} size={128} />
      </div>
      <Img src={staticFile(c.image)} style={{ position: "absolute", left: 250, top: 690, width: 835, transformOrigin: c.origin, scale: `${c.scale}`, filter: "drop-shadow(12px 16px 0 rgba(20,20,20,0.14))" }} />
      {c.stickers.map((s, i) => (
        <Sticker key={i} x={s.x} y={s.y} rot={s.rot} style={s.style}>
          <Icon name={s.icon} size={46} color={s.style === "light" || !s.style ? C.accent : "#fff"} stroke={2.6} />
          <div><div style={{ fontWeight: 800, fontSize: 40, lineHeight: 1 }}>{s.big}</div>{s.small && <div style={{ fontSize: 20, opacity: 0.7, fontWeight: 600 }}>{s.small}</div>}</div>
        </Sticker>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, height: 360, background: `linear-gradient(180deg, ${hexA(C.bg, 0)} 0%, ${C.bg} 70%)` }} />
      <div style={{ position: "absolute", left: 70, top: 1720 }}><Pill size={26} bg={C.ink} color="#fff">{c.label}</Pill></div>
    </AbsoluteFill>
  );
};
