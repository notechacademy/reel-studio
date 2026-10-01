import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, Easing, Img } from "remotion";
import { Video, Audio } from "@remotion/media";
import { C, F, clamp, outExpo, backOut, hexA } from "./theme";
import { T, E, END_FROM, W, H, segAt } from "./edit";
import { Pill, Title, Label, NumCircle, Icon } from "./ui";
import { Scenes } from "./scenes";
import { Captions } from "./Captions";

// ---------------- dark background used by question panels / end card ----------------
export const DarkBg: React.FC = () => (
  <AbsoluteFill style={{ background: C.dark }}>
    <AbsoluteFill style={{ background: `radial-gradient(circle at 12% 0%, ${C.darkGlow} 0%, ${hexA(C.darkGlow, 0)} 62%)` }} />
    <AbsoluteFill style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.035) 2px, transparent 2px)",
      backgroundSize: "90px 90px",
    }} />
  </AbsoluteFill>
);

// ---------------- the talking-head footage: one clip, framed per frame ----------------
const WIN = { x: 270, y: 760, w: 540, h: 960, r: 36 };
const VideoLayer: React.FC<{ f: number }> = ({ f }) => {
  const seg = segAt(f);
  if (!seg) return null;
  const isQ = seg.kind === "q";
  let scale = 1, tx = 0, ty = 0, radius = 0, p = 0;
  const lf = f - seg.from_;
  if (isQ) {
    // video shrinks into a framed window, then expands back into the next shot
    const pin = interpolate(lf, [0, 8], [0, 1], { ...clamp, easing: outExpo });
    const pout = interpolate(lf, [seg.dur - 7, seg.dur], [1, 0], { ...clamp, easing: Easing.bezier(0.7, 0, 0.84, 0) });
    p = Math.min(pin, pout);
    scale = 1 + (WIN.w / W - 1) * p;
    tx = (WIN.x + WIN.w / 2 - W / 2) * p;
    ty = (WIN.y + WIN.h / 2 - H / 2) * p;
    radius = (WIN.r / scale) * p;
  } else {
    scale = 1 + 0.035 * (lf / seg.dur); // slow push-in
    if (seg.from_ === 0) scale *= interpolate(lf, [0, 10], [1.16, 1], { ...clamp, easing: outExpo }); // intro punch-out
    for (const pf of E.punches) {
      if (pf >= seg.from_ && f >= pf) {
        scale *= 1 + 0.08 * interpolate(f - pf, [0, 3], [0, 1], { ...clamp, easing: outExpo });
        const d = f - pf;
        if (d < 5) { tx += Math.sin(d * 2.7) * (5 - d) * 2.2; ty += Math.cos(d * 3.1) * (5 - d) * 2.2; }
      }
    }
  }
  return (
    <>
      {isQ && <DarkBg />}
      <AbsoluteFill style={{ transformOrigin: "50% 45%", translate: `${tx}px ${ty}px`, scale: `${scale}` }}>
        <AbsoluteFill style={{ borderRadius: radius, overflow: "hidden", outline: p > 0.97 ? `${4 / scale}px solid ${C.accent}` : undefined, boxShadow: p > 0.97 ? `0 0 ${60 / scale}px ${hexA(C.accent, 0.55)}` : undefined }}>
          <Video src={staticFile("base.mp4")} muted style={{ width: W, height: H }} />
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  );
};

// ---------------- question panel texts ----------------
const QText: React.FC<{ f: number }> = ({ f }) => {
  const seg = segAt(f);
  if (!seg || seg.kind !== "q") return null;
  const idx = T.segs.indexOf(seg);
  const q = E.questions.find((x) => x.seg === idx);
  if (!q) return null;
  const n = q.n; const lf = f - seg.from_;
  const a1 = interpolate(lf, [3, 10], [0, 1], { ...clamp, easing: outExpo });
  const a2 = interpolate(lf, [5, 12], [0, 1], { ...clamp, easing: outExpo });
  const k = interpolate(f, [q.kw_at - 2, q.kw_at + 5], [0, 1], { ...clamp, easing: backOut });
  const total = E.sections_total;
  const label = E.question_label.replace("{n}", String(n)).replace("{total}", String(total));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, top: 120, width: 960, display: "flex", gap: 12, opacity: a1 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((i) => (
          <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i <= n ? C.accent : hexA(C.surface, 0.22) }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, top: 180, display: "flex", alignItems: "center", gap: 20, opacity: a1, translate: `0 ${(1 - a1) * -30}px` }}>
        <NumCircle n={n} size={86} bg={C.surface} color={C.accentDark} />
        <Label color={C.accentSoft} size={28}>{label}</Label>
      </div>
      {E.question_pre && (
        <div style={{ position: "absolute", left: 60, top: 320, opacity: a2, translate: `0 ${(1 - a2) * 50}px` }}>
          <Title lines={[[[E.question_pre, "n"]]]} size={150} color={C.surface} />
        </div>
      )}
      {k > 0 && (
        <div style={{ position: "absolute", left: 60, top: E.question_pre ? 320 + 153 : 320, scale: `${0.55 + 0.45 * k}`, transformOrigin: "0% 50%", opacity: Math.min(1, k * 2) }}>
          <Title lines={[[[q.keyword, "b"]]]} size={q.keyword.length > 13 ? Math.round(150 * 13 / q.keyword.length) + 10 : 150} color={C.surface} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------- slim cards on top of the talking shots ----------------
const Cards: React.FC<{ f: number }> = ({ f }) => (
  <>
    {E.cards.map((c, i) => {
      if (f < c.from || f >= c.to) return null;
      const lf = f - c.from;
      const e = interpolate(lf, [0, 8], [0, 1], { ...clamp, easing: backOut });
      const anim = c.anim ?? "drop";
      const style: React.CSSProperties =
        anim === "flip" ? { scale: `1 ${Math.max(0.02, e)}` } :
        anim === "settle" ? { scale: `${interpolate(lf, [0, 8], [1.06, 1], { ...clamp, easing: outExpo })}` } :
        { translate: `0 ${(1 - e) * -60}px`, opacity: Math.min(1, e * 1.6) };
      const dark = c.style === "dark"; const acc = c.style === "accent";
      const fg = dark || acc ? C.surface : C.ink;
      const bp = c.block_at !== undefined ? interpolate(f, [c.block_at, c.block_at + 5], [0, 1], { ...clamp, easing: outExpo }) : 1;
      return (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 118, display: "flex", justifyContent: "center", ...style }}>
          <div style={{
            background: acc ? C.accent : dark ? C.dark : C.surface, border: dark ? `3px solid ${C.accent}` : undefined, borderRadius: 28,
            padding: "24px 32px", boxShadow: "0 14px 40px rgba(0,0,0,0.28)", display: "flex", alignItems: "center", gap: 22, maxWidth: 980,
          }}>
            {c.num !== undefined && <NumCircle n={c.num} size={80} />}
            <div>
              {c.label && <Label color={dark ? C.accentSoft : acc ? C.surface : C.accentDark}>{c.label}</Label>}
              <Title lines={c.lines} size={c.size ?? 62} color={fg} blockProgress={bp} />
            </div>
          </div>
        </div>
      );
    })}
  </>
);

// ---------------- text BEHIND the person (optional, only when requested) ----------------
// needs a matte sequence made by scripts/matte.py: public/<matte_dir>/000001.png ...
const Behind: React.FC<{ f: number }> = ({ f }) => (
  <>
    {E.behind.map((b, i) => {
      if (f < b.from || f >= b.to) return null;
      const lf = f - b.from;
      const e = interpolate(lf, [0, 10], [0, 1], { ...clamp, easing: outExpo });
      const out = interpolate(f, [b.to - 6, b.to], [1, 0], clamp);
      const idx = String(lf + 1).padStart(6, "0");
      return (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: 0, right: 0, top: b.y, display: "flex", justifyContent: "center", opacity: Math.min(e, out), scale: `${0.9 + 0.1 * e}` }}>
            <Title lines={b.lines} size={b.size} color={C.surface} style={{ textAlign: "center", textShadow: "0 10px 40px rgba(0,0,0,0.25)" }} />
          </div>
          <Img src={staticFile(`${b.matte_dir}/${idx}.png`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
        </React.Fragment>
      );
    })}
  </>
);

// ---------------- end card (CTA) ----------------
const EndCard: React.FC<{ f: number }> = ({ f }) => {
  const e = E.end;
  if (!e || f < END_FROM) return null;
  const lf = f - END_FROM;
  const slide = interpolate(lf, [0, 9], [1, 0], { ...clamp, easing: outExpo });
  const a = (d: number) => interpolate(lf, [d, d + 8], [0, 1], { ...clamp, easing: outExpo });
  const boxAt = END_FROM + 14;
  const box = interpolate(f, [boxAt, boxAt + 8], [0, 1], { ...clamp, easing: backOut });
  const pulse = 1 + 0.025 * Math.sin((f - boxAt) / 4) * (f > boxAt + 10 ? 1 : 0);
  return (
    <AbsoluteFill style={{ translate: `0 ${slide * H}px` }}>
      <DarkBg />
      {e.chips && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 200, display: "flex", flexWrap: "wrap", gap: 14 }}>
          {e.chips.map(([t, ok], i) => (
            <div key={i} style={{ opacity: a(4 + i * 3), translate: `0 ${(1 - a(4 + i * 3)) * 20}px` }}>
              <Pill size={22} bg={ok ? C.accent : "transparent"} color={ok ? "#fff" : C.accentSoft} border={ok ? undefined : C.accentSoft}>
                <Icon name={ok ? "check" : "lock"} size={24} color={ok ? "#fff" : C.accentSoft} stroke={3} />{t}
              </Pill>
            </div>
          ))}
        </div>
      )}
      <div style={{ position: "absolute", left: 70, top: 400, opacity: a(10) }}>
        <Label color={C.accentSoft} size={30}>{e.label}</Label>
      </div>
      <div style={{ position: "absolute", left: 70, top: 460, opacity: a(13), translate: `0 ${(1 - a(13)) * 40}px` }}>
        <Title lines={e.lines} size={150} color={C.surface} />
      </div>
      <div style={{ position: "absolute", left: 70, top: 1010, scale: `${(0.6 + 0.4 * box) * pulse}`, opacity: Math.min(1, box * 2), transformOrigin: "0% 50%" }}>
        <div style={{ border: `4px solid ${C.accent}`, borderRadius: 32, padding: "30px 54px 20px", background: C.dark, boxShadow: `0 0 70px ${hexA(C.accent, 0.55)}` }}>
          <Label color={hexA(C.surface, 0.75)} size={34}>{e.cta_label}</Label>
          <div style={{ fontFamily: F.display, fontSize: e.keyword.length > 9 ? 130 : 160, lineHeight: 1.05, color: C.accent }}>{e.keyword}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1370, fontFamily: F.body, fontWeight: 500, fontSize: 44, color: hexA(C.surface, 0.9), opacity: a(26) }}>
        {e.sub}
      </div>
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.dark }}>
      <VideoLayer f={f} />
      <Behind f={f} />
      <QText f={f} />
      <Cards f={f} />
      <Scenes f={f} />
      <Captions f={f} />
      <EndCard f={f} />
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
