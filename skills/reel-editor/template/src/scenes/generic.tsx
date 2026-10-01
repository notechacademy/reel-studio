import React from "react";
import { interpolate, staticFile, Img, Sequence } from "remotion";
import { Video } from "@remotion/media";
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { C, F, clamp, stepF, popIn, paperShadow, outExpo } from "../theme";
import { Icon, Pill, fmt } from "../ui";
import { Stage, Headline, Phone, Tap } from "./kit";
import type { Scene } from "../edit";

// ================= checklist: items get ticked one by one =================
export const Checklist: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props; const items = p.items as { text: string; at: number; bad?: boolean }[];
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`ck${s.from}`} tag={s.tag} n={s.n}>
      {() => (
        <>
          {p.headline && <Headline text={p.headline} />}
          <div style={{ position: "absolute", left: 70, right: 70, top: 420, background: C.surface, borderRadius: 36, padding: "36px 44px", boxShadow: paperShadow, fontFamily: F.body }}>
            {items.map((it, i) => {
              const on = stepF(f) >= it.at; const pp = popIn(f, it.at, 6);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 0", borderBottom: i < items.length - 1 ? "2px solid rgba(0,0,0,0.06)" : undefined }}>
                  <div style={{ width: 70, height: 70, borderRadius: 18, border: `4px solid ${on ? (it.bad ? C.ink : C.accent) : "#CCC"}`, background: on ? (it.bad ? C.ink : C.accent) : "transparent", display: "flex", alignItems: "center", justifyContent: "center", scale: `${on ? 0.8 + 0.2 * pp : 1}` }}>
                    {on && <Icon name={it.bad ? "x" : "check"} size={44} color="#fff" stroke={3.6} />}
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 700, color: on ? C.ink : C.muted, textDecoration: on && it.bad ? "line-through" : undefined, textDecorationColor: C.accent }}>{it.text}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Stage>
  );
};

// ================= before-after: two cards, "after" slams in =================
export const BeforeAfter: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`ba${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const a = popIn(f, p.before.at ?? s.from + 4, 6); const b = popIn(f, p.after.at, 6);
        const card = (side: "before" | "after", k: number, rot: number, top: number) => {
          const d = p[side];
          const good = side === "after";
          return (
            <div style={{ position: "absolute", left: 70, right: 70, top, rotate: `${rot}deg`, scale: `${0.6 + 0.4 * k}`, opacity: k, background: good ? C.dark : C.surface, color: good ? C.surface : C.ink, borderRadius: 32, padding: "34px 40px", boxShadow: paperShadow, border: good ? `4px solid ${C.accent}` : undefined }}>
              <Pill size={22} bg={good ? C.accent : C.ink} color="#fff">{d.label}</Pill>
              <div style={{ fontFamily: F.display, fontSize: 72, lineHeight: 1.05, marginTop: 18, textTransform: "uppercase", textDecoration: good ? undefined : "line-through", textDecorationColor: C.accent, textDecorationThickness: 8 }}>{d.text}</div>
              {d.sub && <div style={{ fontFamily: F.body, fontSize: 32, marginTop: 10, opacity: 0.75 }}>{d.sub}</div>}
            </div>
          );
        };
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            {card("before", a, -2, 420)}
            {card("after", b, 2, 800)}
          </>
        );
      }}
    </Stage>
  );
};

// ================= notifications: lock-screen notifications pile up =================
export const Notifications: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props; const items = p.items as { app: string; text: string; at: number; icon?: string }[];
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`nt${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const shown = items.filter((x) => stepF(f) >= x.at);
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            <Phone x={190} y={380} w={700} h={880}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${C.dark}, ${C.darkGlow})` }} />
              <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", color: "#fff", fontFamily: F.body, fontWeight: 300, fontSize: 120 }}>{p.clock ?? "9:41"}</div>
              <div style={{ position: "absolute", left: 22, right: 22, top: 290, display: "flex", flexDirection: "column-reverse", gap: 14 }}>
                {shown.slice(-5).map((it, i) => {
                  const pp = popIn(f, it.at, 6);
                  return (
                    <div key={i} style={{ background: "rgba(255,255,255,0.92)", borderRadius: 26, padding: "18px 20px", display: "flex", gap: 16, alignItems: "center", fontFamily: F.body, scale: `${0.85 + 0.15 * pp}`, opacity: pp }}>
                      <div style={{ width: 58, height: 58, borderRadius: 14, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={it.icon ?? "bell"} size={30} color="#fff" /></div>
                      <div><div style={{ fontWeight: 800, fontSize: 24, color: C.ink }}>{it.app} · ora</div><div style={{ fontSize: 25, color: C.ink }}>{it.text}</div></div>
                    </div>
                  );
                })}
              </div>
            </Phone>
          </>
        );
      }}
    </Stage>
  );
};

// ================= big-number: one huge stat counting up =================
export const BigNumber: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`bn${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const v = interpolate(stepF(f), [p.count_from_at ?? s.from + 4, p.count_to_at ?? s.to - 15], [p.from ?? 0, p.to], { ...clamp, easing: outExpo });
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: F.display, fontSize: 300, lineHeight: 1, color: C.accent }}>{(p.prefix ?? "") + fmt(v) + (p.suffix ?? "")}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 48, color: C.ink }}>{p.caption}</div>
          </>
        );
      }}
    </Stage>
  );
};

// ================= phone-recording: a REAL screen recording inside a phone, with zooms and taps =================
// props: { src: "rec/xxx.mp4" (in public/), trim_from: frames, headline?, zooms: [{at, scale, x, y}], taps: [{at, x, y}] }
// x/y of zooms & taps are in % of the phone screen (0..1)
export const PhoneRecording: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  const laptop = p.device === "laptop";
  const PW = laptop ? 940 : 540, PH = laptop ? 600 : 960, PX = laptop ? 70 : 270, PY = laptop ? 480 : 310;
  const zooms = (p.zooms ?? []) as { at: number; scale: number; x: number; y: number }[];
  let zs = 1, zx = 0.5, zy = 0.5;
  for (const z of zooms) {
    const k = interpolate(f, [z.at, z.at + 10], [0, 1], { ...clamp, easing: outExpo });
    if (k > 0) { zs = zs + (z.scale - zs) * k; zx = zx + (z.x - zx) * k; zy = zy + (z.y - zy) * k; }
  }
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`pr${s.from}`} tag={s.tag} n={s.n}>
      {() => (
        <>
          {p.headline && <Headline text={p.headline} top={laptop ? 260 : 200} size={80} />}
          {laptop && <div style={{ position: "absolute", left: PX - 50, top: PY + PH - 4, width: PW + 100, height: 34, borderRadius: "0 0 30px 30px", background: C.ink, boxShadow: paperShadow }} />}
          <Phone x={PX} y={PY} w={PW} h={PH} laptop={laptop}>
            <div style={{ position: "absolute", inset: 0, transformOrigin: `${zx * 100}% ${zy * 100}%`, scale: `${zs}` }}>
              <Sequence from={s.from} layout="none"><Video src={staticFile(p.src)} trimBefore={p.trim_from ?? 0} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Sequence>
            </div>
          </Phone>
          {((p.taps ?? []) as { at: number; x: number; y: number }[]).map((t, i) => (
            <Tap key={i} f={f} at={t.at} x={PX + 16 + t.x * (PW - 32)} y={PY + 16 + t.y * (PH - 32)} />
          ))}
        </>
      )}
    </Stage>
  );
};

// ================= lottie: an After Effects animation exported as Lottie JSON (public/lottie/xxx.json) =================
// The JSON must be loaded beforehand: Claude copies it into src/data/lottie/ and imports it in scenes/index.tsx
export const LottieScene: React.FC<{ f: number; s: Scene; data?: LottieAnimationData }> = ({ f, s, data }) => {
  const p = s.props;
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`lt${s.from}`} tag={s.tag} n={s.n}>
      {() => (
        <>
          {p.headline && <Headline text={p.headline} />}
          <div style={{ position: "absolute", left: 90, right: 90, top: 400, height: 860 }}>
            {data ? <Sequence from={s.from} layout="none"><Lottie animationData={data} style={{ width: "100%", height: "100%" }} /></Sequence> : p.image ? <Img src={staticFile(p.image)} style={{ width: "100%" }} /> : null}
          </div>
        </>
      )}
    </Stage>
  );
};
