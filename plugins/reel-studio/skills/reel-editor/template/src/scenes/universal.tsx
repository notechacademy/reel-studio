import React from "react";
import { interpolate, staticFile, Img } from "remotion";
import { C, F, UPPER, clamp, stepF, popIn, paperShadow, outExpo, backOut } from "../theme";
import { Icon, Avatar, NumCircle } from "../ui";
import { Stage, Headline } from "./kit";
import type { Scene } from "../edit";

// Universal scenes: they work for ANY topic (fitness, food, law, real estate, coaching, retail...).
// Text accent syntax everywhere: "*word*" = accent colour.
const Acc: React.FC<{ t: string }> = ({ t }) => (
  <>{t.split(/(\*[^*]+\*)/g).filter(Boolean).map((p, i) => p.startsWith("*") ? <span key={i} style={{ color: C.accent }}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>)}</>
);

// ================= kinetic-title: a statement that slams in word by word =================
// props: { words: [{text, at}], dark?: boolean, sub?: {text, at} }   (wrap "*word*" for accent)
export const KineticTitle: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props; const words = p.words as { text: string; at: number }[];
  const total = words.map((w) => w.text.replace(/\*/g, "")).join(" ").length;
  const size = Math.min(170, Math.floor(3600 / Math.max(10, total)));
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`kt${s.from}`} tag={s.tag} n={s.n} dark={!!p.dark} noBadge>
      {() => (
        <>
          <div style={{ position: "absolute", left: 70, right: 70, top: 420, fontFamily: F.display, fontSize: size, lineHeight: 1.02, textTransform: UPPER, color: p.dark ? C.surface : C.ink, display: "flex", flexWrap: "wrap", gap: `0 ${size * 0.25}px` }}>
            {words.map((w, i) => {
              const k = interpolate(stepF(f), [w.at, w.at + 4], [0, 1], { ...clamp, easing: backOut });
              return <span key={i} style={{ opacity: k > 0 ? 1 : 0, scale: `${1.5 - 0.5 * k}`, display: "inline-block", transformOrigin: "0% 80%" }}><Acc t={w.text} /></span>;
            })}
          </div>
          {p.sub && <div style={{ position: "absolute", left: 70, right: 70, top: 1120, fontFamily: F.body, fontWeight: 600, fontSize: 44, color: p.dark ? C.accentSoft : C.muted, opacity: popIn(f, p.sub.at, 6) }}>{p.sub.text}</div>}
        </>
      )}
    </Stage>
  );
};

// ================= steps: numbered process with a progress line =================
// props: { headline, steps: [{title, sub?, at}] }   2-5 steps
export const Steps: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props; const steps = p.steps as { title: string; sub?: string; at: number }[];
  const gap = Math.min(230, 820 / steps.length);
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`st${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const done = steps.filter((x) => stepF(f) >= x.at).length;
        const line = done <= 1 ? 0 : (done - 1) / (steps.length - 1);
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            <div style={{ position: "absolute", left: 111, top: 420, width: 8, height: gap * (steps.length - 1), background: "rgba(0,0,0,0.08)", borderRadius: 4 }}>
              <div style={{ width: "100%", height: `${line * 100}%`, background: C.accent, borderRadius: 4 }} />
            </div>
            {steps.map((st, i) => {
              const k = popIn(f, st.at, 6); const on = k > 0;
              return (
                <div key={i} style={{ position: "absolute", left: 70, top: 380 + i * gap, display: "flex", alignItems: "center", gap: 30, opacity: on ? 1 : 0.35 }}>
                  <div style={{ scale: `${on ? 0.7 + 0.3 * k : 0.85}` }}><NumCircle n={i + 1} size={90} bg={on ? C.accent : C.surface} color={on ? "#fff" : C.muted} /></div>
                  <div style={{ background: C.surface, borderRadius: 24, padding: "20px 28px", boxShadow: on ? paperShadow : "none", translate: `${(1 - k) * 40}px 0`, maxWidth: 760 }}>
                    <div style={{ fontFamily: F.display, fontSize: 56, lineHeight: 1, textTransform: UPPER, color: C.ink }}><Acc t={st.title} /></div>
                    {st.sub && <div style={{ fontFamily: F.body, fontSize: 30, color: C.muted, marginTop: 6 }}>{st.sub}</div>}
                  </div>
                </div>
              );
            })}
          </>
        );
      }}
    </Stage>
  );
};

// ================= bar-chart: comparison bars growing =================
// props: { headline, bars: [{label, value, at, highlight?}], unit?: "%", caption? }
export const BarChart: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props; const bars = p.bars as { label: string; value: number; at: number; highlight?: boolean }[];
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`bc${s.from}`} tag={s.tag} n={s.n}>
      {() => (
        <>
          {p.headline && <Headline text={p.headline} />}
          <div style={{ position: "absolute", left: 70, right: 70, top: 400, background: C.surface, borderRadius: 36, padding: "40px 44px", boxShadow: paperShadow }}>
            {bars.map((b, i) => {
              const k = interpolate(f, [b.at, b.at + 14], [0, 1], { ...clamp, easing: outExpo });
              const col = b.highlight ? C.accent : C.ink;
              return (
                <div key={i} style={{ marginBottom: i < bars.length - 1 ? 34 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.body, fontWeight: 700, fontSize: 34, color: C.ink, marginBottom: 10 }}>
                    <span>{b.label}</span><span style={{ color: col, opacity: k > 0 ? 1 : 0 }}>{Math.round(b.value * k).toLocaleString("it-IT")}{p.unit ?? ""}</span>
                  </div>
                  <div style={{ height: 54, background: "rgba(0,0,0,0.06)", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(b.value / max) * 100 * k}%`, background: col, borderRadius: 14 }} />
                  </div>
                </div>
              );
            })}
          </div>
          {p.caption && <div style={{ position: "absolute", left: 70, right: 70, top: 1130, fontFamily: F.body, fontSize: 36, color: C.muted }}>{p.caption}</div>}
        </>
      )}
    </Stage>
  );
};

// ================= quote: a sentence that deserves to be remembered (testimonial, insight, rule) =================
// props: { text, author?, at, dark? }
export const Quote: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`qt${s.from}`} tag={s.tag} n={s.n} dark={p.dark !== false} noBadge>
      {() => {
        const k = interpolate(f, [p.at ?? s.from + 6, (p.at ?? s.from + 6) + 18], [0, 1], { ...clamp, easing: outExpo });
        const fg = p.dark !== false ? C.surface : C.ink;
        return (
          <>
            <div style={{ position: "absolute", left: 80, top: 420, fontFamily: F.quote, fontStyle: "italic", fontSize: 200, color: C.accent, lineHeight: 1 }}>“</div>
            <div style={{ position: "absolute", left: 80, right: 80, top: 600, fontFamily: F.quote, fontStyle: "italic", fontSize: 76, lineHeight: 1.15, color: fg, opacity: k, translate: `0 ${(1 - k) * 30}px` }}><Acc t={p.text} /></div>
            {p.author && <div style={{ position: "absolute", left: 80, top: 1150, display: "flex", alignItems: "center", gap: 18, opacity: k }}>
              <div style={{ width: 70, height: 4, background: C.accent }} />
              <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: fg, textTransform: "uppercase" }}>{p.author}</div>
            </div>}
          </>
        );
      }}
    </Stage>
  );
};

// ================= image-card: a real photo / B-roll / product in a framed card with slow zoom =================
// props: { src: "img/x.jpg" (public/), headline?, label?, caption?, at? }
export const ImageCard: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`ic${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const kb = interpolate(f, [s.from, s.to], [1.0, 1.12]);
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            <div style={{ position: "absolute", left: 110, top: 380, width: 860, height: 820, rotate: "-1.5deg", background: "#fff", padding: 18, paddingBottom: 90, boxShadow: paperShadow }}>
              <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: `${kb}` }} />
              </div>
              {p.caption && <div style={{ position: "absolute", left: 30, bottom: 22, fontFamily: F.quote, fontStyle: "italic", fontSize: 44, color: C.ink }}>{p.caption}</div>}
            </div>
            {p.label && <div style={{ position: "absolute", right: 70, top: 1150, rotate: "5deg", background: C.accent, color: "#fff", fontFamily: F.display, fontSize: 56, padding: "10px 26px", textTransform: UPPER, boxShadow: paperShadow, scale: `${popIn(f, p.at ?? s.from + 12, 6)}` }}>{p.label}</div>}
          </>
        );
      }}
    </Stage>
  );
};

// ================= messages: a chat conversation (client asks, you answer / a friend reacts) =================
// props: { headline?, title: "Giulia", messages: [{from: "them"|"me", text, at}] }
export const Messages: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props; const msgs = p.messages as { from: "them" | "me"; text: string; at: number }[];
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`ms${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const shown = msgs.filter((m) => stepF(f) >= m.at);
        const next = msgs.find((m) => stepF(f) < m.at && m.at - stepF(f) < 15);
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            <div style={{ position: "absolute", left: 70, right: 70, top: 380, height: 880, background: "#fff", borderRadius: 40, boxShadow: paperShadow, overflow: "hidden", fontFamily: F.body }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "26px 34px", borderBottom: "2px solid #EEE" }}>
                <Avatar name={p.title ?? "Cliente"} size={64} hue={200} />
                <div style={{ fontWeight: 800, fontSize: 32, color: C.ink }}>{p.title ?? "Cliente"}</div>
              </div>
              <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, display: "flex", flexDirection: "column", gap: 16 }}>
                {shown.slice(-6).map((m, i) => {
                  const k = popIn(f, m.at, 5); const me = m.from === "me";
                  return (
                    <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "78%", background: me ? C.accent : "#F0F0F0", color: me ? "#fff" : C.ink, fontSize: 34, padding: "18px 26px", borderRadius: me ? "28px 28px 6px 28px" : "28px 28px 28px 6px", scale: `${0.8 + 0.2 * k}`, opacity: k, transformOrigin: me ? "100% 100%" : "0% 100%" }}>{m.text}</div>
                  );
                })}
                {next && <div style={{ alignSelf: next.from === "me" ? "flex-end" : "flex-start", background: "#F0F0F0", borderRadius: 24, padding: "16px 24px", fontSize: 34, color: C.muted, letterSpacing: 4 }}>{"•••".slice(0, 1 + (Math.floor(f / 4) % 3))}</div>}
              </div>
            </div>
          </>
        );
      }}
    </Stage>
  );
};

// ================= icon-grid: 2-4 benefits/features with icons popping in =================
// props: { headline, items: [{icon, title, sub?, at}] }   icons: see ui.tsx Icon names
export const IconGrid: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props; const items = p.items as { icon: string; title: string; sub?: string; at: number }[];
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`ig${s.from}`} tag={s.tag} n={s.n}>
      {() => (
        <>
          {p.headline && <Headline text={p.headline} />}
          <div style={{ position: "absolute", left: 70, right: 70, top: 400, display: "grid", gridTemplateColumns: items.length > 2 ? "1fr 1fr" : "1fr", gap: 26 }}>
            {items.map((it, i) => {
              const k = popIn(f, it.at, 6);
              return (
                <div key={i} style={{ background: i % 3 === 0 ? C.dark : C.surface, color: i % 3 === 0 ? C.surface : C.ink, borderRadius: 30, padding: "34px 30px", boxShadow: paperShadow, opacity: k, scale: `${0.7 + 0.3 * k}`, rotate: `${(i % 2 ? 1.5 : -1.5)}deg`, minHeight: 300 }}>
                  <div style={{ width: 88, height: 88, borderRadius: 24, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={it.icon} size={52} color="#fff" stroke={2.4} /></div>
                  <div style={{ fontFamily: F.display, fontSize: 52, lineHeight: 1, marginTop: 22, textTransform: UPPER }}>{it.title}</div>
                  {it.sub && <div style={{ fontFamily: F.body, fontSize: 28, opacity: 0.75, marginTop: 10 }}>{it.sub}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Stage>
  );
};
