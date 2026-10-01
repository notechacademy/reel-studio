import React from "react";
import { interpolate } from "remotion";
import { C, F, clamp, stepF, popIn, paperShadow, outExpo } from "../theme";
import { Icon, Pill, Avatar, fmt } from "../ui";
import { Stage, Headline, Tap, Phone } from "./kit";
import type { Scene } from "../edit";

// All "at" values in props are ABSOLUTE frames of the output timeline.

// ================= profile-follow: a profile gets a new follower, counter climbs, optional banner =================
export const ProfileFollow: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`pf${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const sf = stepF(f);
        const tap = p.tap_at as number; const banner = p.banner_at as number | undefined;
        const followed = sf >= tap;
        const count = sf < tap ? p.followers_from : interpolate(sf, [tap, tap + 3, banner ?? s.to - 10, s.to], [p.followers_from, p.followers_from + 1, p.followers_mid ?? p.followers_from * 4, p.followers_to], { ...clamp, easing: (t) => t * t });
        const bn = banner ? popIn(f, banner, 6) : 0;
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            <Phone x={230} y={380} w={620} h={880}>
              <div style={{ padding: "74px 34px 0", fontFamily: F.body }}>
                <div style={{ fontWeight: 800, fontSize: 30, color: C.ink, marginBottom: 26 }}>{p.handle ?? "iltuobrand"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                  <div style={{ width: 132, height: 132, borderRadius: "50%", padding: 5, background: `conic-gradient(${C.accent}, ${C.accentSoft}, ${C.accent})` }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.bg, border: "5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="user" size={64} color={C.muted} />
                    </div>
                  </div>
                  {[[String(p.posts ?? 128), "post"], [fmt(count), "follower"], [String(p.following ?? 312), "seguiti"]].map(([v, l], i) => (
                    <div key={i} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: i === 1 ? 38 : 32, color: i === 1 && followed ? C.accent : C.ink, scale: i === 1 && followed && sf < tap + 9 ? "1.18" : "1" }}>{v}</div>
                      <div style={{ fontSize: 22, color: C.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 22, height: 16, width: "72%", background: "#ECE8E1", borderRadius: 8 }} />
                <div style={{ marginTop: 12, height: 16, width: "54%", background: "#ECE8E1", borderRadius: 8 }} />
                <div style={{ marginTop: 26, height: 64, borderRadius: 16, background: followed ? "#EFEFEF" : C.accent, color: followed ? C.ink : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 28 }}>
                  {followed ? "Segui già ✓" : "Segui"}
                </div>
                <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {[p.first_tile ?? "PARTE 1", "", "", "", "", ""].map((t: string, i: number) => (
                    <div key={i} style={{ height: 230, background: i === 0 ? C.ink : `hsl(${20 + i * 40} 25% ${86 - i * 2}%)`, color: "#fff", fontFamily: F.display, fontSize: 30, display: "flex", alignItems: "flex-end", padding: 12, position: "relative" }}>
                      {t}
                      {i === 0 && <div style={{ position: "absolute", right: 12, top: 12 }}><Icon name="play" size={28} color="#fff" fill="#fff" /></div>}
                    </div>
                  ))}
                </div>
              </div>
              {bn > 0 && (
                <div style={{ position: "absolute", left: 18, right: 18, top: 60, translate: `0 ${(1 - bn) * -160}px`, background: "rgba(250,250,250,0.97)", borderRadius: 26, boxShadow: "0 12px 30px rgba(0,0,0,0.22)", padding: "20px 22px", display: "flex", gap: 18, alignItems: "center", fontFamily: F.body, zIndex: 6 }}>
                  <div style={{ width: 62, height: 62, borderRadius: 16, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="play" size={32} color="#fff" fill="#fff" /></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 26, color: C.ink }}>{(p.handle ?? "iltuobrand") + " · ora"}</div>
                    <div style={{ fontSize: 25, color: C.ink }}>{p.banner_text ?? "Nuovo reel: PARTE 2 è online"}</div>
                  </div>
                </div>
              )}
            </Phone>
            <Tap f={f} at={tap} x={540} y={810} />
            {followed && (
              <div style={{ position: "absolute", left: 470, top: 1150, rotate: "-5deg", zIndex: 20, scale: `${popIn(f, tap + 2, 6)}` }}>
                <Pill size={30} bg={C.ink} color="#fff">{p.badge ?? "+ NUOVO FOLLOWER"}</Pill>
              </div>
            )}
          </>
        );
      }}
    </Stage>
  );
};

// ================= views-stamps: a reel card with views climbing + stamps that slam in + handwritten note =================
const Stamp: React.FC<{ f: number; at: number; text: string; variant: number; x: number; y: number; rot: number }> = ({ f, at, text, variant, x, y, rot }) => {
  const lf = stepF(f) - at;
  if (lf < 0) return null;
  const s = lf < 3 ? 1.7 : lf < 6 ? 0.94 : 1;
  const st = [{ bg: C.accent, color: "#fff", border: undefined }, { bg: C.ink, color: C.surface, border: undefined }, { bg: C.surface, color: C.accent, border: C.accent }][variant % 3];
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, scale: `${s}`, opacity: lf < 3 ? 0.6 : 1 }}>
      <div style={{ background: st.bg, color: st.color, border: st.border ? `5px solid ${st.border}` : undefined, fontFamily: F.display, fontSize: 70, padding: "16px 30px 12px", borderRadius: 18, boxShadow: paperShadow, display: "flex", alignItems: "center", gap: 14, textTransform: "uppercase" }}>
        <Icon name="check" size={52} color={st.color} stroke={3.4} />{text}
      </div>
    </div>
  );
};
export const ViewsStamps: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  const stamps = p.stamps as { text: string; at: number }[];
  const POS = [{ x: 40, y: 930, r: -7 }, { x: 380, y: 1010, r: 4 }, { x: 640, y: 880, r: -3 }];
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`vs${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const sf = stepF(f);
        const keys = [s.from, ...stamps.map((x) => x.at), s.to];
        const vals = keys.map((_, i) => p.views_from * Math.pow(p.views_to / p.views_from, i / (keys.length - 1)));
        const views = interpolate(sf, keys, vals, clamp);
        const nt = p.note ? interpolate(sf, [p.note.at, p.note.at + 12], [0, 1], { ...clamp, easing: outExpo }) : 0;
        return (
          <>
            <div style={{ position: "absolute", left: 250, top: 250, width: 580, height: 640, borderRadius: 40, background: C.dark, boxShadow: paperShadow, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 44, top: 70, right: 30, fontFamily: F.display, fontSize: 86, lineHeight: 1, color: C.surface, textTransform: "uppercase" }}>
                {(p.reel_lines as string[]).map((l, i, arr) => (
                  <div key={i}>{i === arr.length - 1 ? <span style={{ background: C.accent, color: "#fff", padding: "0 10px" }}>{l}</span> : l}</div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 44, bottom: 50, display: "flex", alignItems: "center", gap: 16, fontFamily: F.body, fontWeight: 800, fontSize: 52, color: "#fff" }}>
                <Icon name="eye" size={60} color="#fff" stroke={2.6} />{fmt(views)}
              </div>
              <div style={{ position: "absolute", right: 40, bottom: 58 }}><Icon name="play" size={56} color="#fff" fill="#fff" /></div>
            </div>
            {stamps.map((st, i) => <Stamp key={i} f={f} at={st.at} text={st.text} variant={i} x={POS[i % 3].x} y={POS[i % 3].y} rot={POS[i % 3].r} />)}
            {nt > 0 && (
              <div style={{ position: "absolute", left: 90, top: 1170, fontFamily: F.quote, fontStyle: "italic", fontSize: 58, color: C.ink, opacity: nt }}>
                <span style={{ color: C.accent, fontSize: 80, verticalAlign: "-14px" }}>“</span>{p.note.text}
                <svg width="620" height="30" style={{ display: "block", marginLeft: 40 }}>
                  <path d="M4 20 C 150 4, 330 30, 612 10" fill="none" stroke={C.accent} strokeWidth={7} strokeLinecap="round" strokeDasharray={640} strokeDashoffset={640 * (1 - nt)} />
                </svg>
              </div>
            )}
          </>
        );
      }}
    </Stage>
  );
};

// ================= comments: comment section filling up =================
export const Comments: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  const list = p.comments as [string, string][];
  const times = p.times as number[];
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`cm${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const sf = stepF(f);
        const shown = times.filter((t) => sf >= t).length;
        const ITEM = 132;
        const scroll = Math.max(0, shown - 5) * ITEM;
        return (
          <>
            {p.headline && <Headline text={p.headline} />}
            <div style={{ position: "absolute", left: 60, top: 360, width: 960, height: 900, background: "#fff", borderRadius: 40, boxShadow: paperShadow, overflow: "hidden" }}>
              <div style={{ padding: "30px 40px 22px", borderBottom: "2px solid #EEE", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: F.body }}>
                <div>
                  <div style={{ fontSize: 22, color: C.muted, fontWeight: 600 }}>{p.context_label ?? "Il tuo reel"}</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: C.ink }}>“{p.topic}”</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 34, color: C.accent }}>
                  <Icon name="bubble" size={40} color={C.accent} />{fmt((p.count_from ?? 1204) + shown * 37)}
                </div>
              </div>
              <div style={{ position: "relative", height: 760, overflow: "hidden" }}>
                <div style={{ translate: `0 ${-scroll}px`, padding: "10px 0" }}>
                  {list.slice(0, shown).map(([u, t], i) => {
                    const pp = popIn(f, times[i], 6);
                    return (
                      <div key={i} style={{ height: ITEM, display: "flex", alignItems: "center", gap: 22, padding: "0 40px", fontFamily: F.body, opacity: Math.min(1, pp * 1.5), translate: `${(1 - pp) * 40}px 0`, scale: `${0.9 + 0.1 * pp}` }}>
                        <Avatar name={u} size={70} hue={(i * 67 + 20) % 360} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>{u} <span style={{ color: C.muted, fontWeight: 500 }}>· ora</span></div>
                          <div style={{ fontSize: 31, color: C.ink, lineHeight: 1.25 }}>{t}</div>
                        </div>
                        <div style={{ textAlign: "center", color: C.muted, fontSize: 20, fontWeight: 700 }}>
                          <Icon name="heart" size={34} color={i % 3 === 1 ? C.accent : C.muted} fill={i % 3 === 1 ? C.accent : "none"} />{(i * 13 + 9) % 70}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        );
      }}
    </Stage>
  );
};

// ================= share-sheet: POV card -> "Invia a" sheet -> tap friend -> paper plane -> reply =================
export const ShareSheet: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const p = s.props;
  const friends = (p.friends as string[]) ?? ["Giulia", "Marta", "Ale", "Fede", "Sara", "Luca", "Mamma", "Bea"];
  return (
    <Stage f={f} from={s.from} to={s.to} seed={`sh${s.from}`} tag={s.tag} n={s.n}>
      {() => {
        const sf = stepF(f);
        const pv = p.pov ? popIn(f, p.pov.at, 6) : 0;
        const sh = interpolate(sf, [p.sheet_at, p.sheet_at + 6], [1, 0], { ...clamp, easing: outExpo });
        const picked = sf >= p.tap_at;
        const pl = interpolate(sf, [p.plane_at, p.plane_at + 9], [0, 1], clamp);
        const done = sf >= p.sent_at;
        return (
          <>
            {p.pov && (
              <div style={{ position: "absolute", left: 90, top: 240, width: 900, rotate: "-2deg", scale: `${0.6 + 0.4 * pv}`, opacity: pv, background: C.surface, borderRadius: 30, padding: "40px 46px", boxShadow: paperShadow }}>
                <Pill size={24}>{p.pov.tag ?? "POV"}</Pill>
                <div style={{ fontFamily: F.display, fontSize: 78, lineHeight: 1.02, color: C.ink, marginTop: 20, textTransform: "uppercase" }}>
                  {String(p.pov.text).split(/(\*[^*]+\*)/g).map((t: string, i: number) => t.startsWith("*") ? <span key={i} style={{ color: C.accent }}>{t.slice(1, -1)}</span> : <span key={i}>{t}</span>)}
                </div>
                {p.pov.sub && <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 34, color: C.muted, marginTop: 10 }}>{p.pov.sub}</div>}
              </div>
            )}
            {sf >= p.sheet_at && (
              <div style={{ position: "absolute", left: 60, top: 660, width: 960, height: 600, translate: `0 ${sh * 700}px`, background: "#fff", borderRadius: 40, boxShadow: paperShadow, padding: "30px 40px", fontFamily: F.body }}>
                <div style={{ width: 90, height: 8, borderRadius: 4, background: "#DDD", margin: "0 auto 22px" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 800, fontSize: 34, color: C.ink }}>Invia a</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", color: C.accent, fontWeight: 800, fontSize: 28 }}>
                    <Icon name="plane" size={34} color={C.accent} />{fmt((p.shares_from ?? 3481) + (done ? 1 : 0))} condivisioni
                  </div>
                </div>
                <div style={{ marginTop: 18, height: 60, borderRadius: 16, background: "#F2F2F2", display: "flex", alignItems: "center", gap: 12, padding: "0 20px", color: C.muted, fontSize: 26 }}>
                  <Icon name="search" size={30} color={C.muted} />Cerca
                </div>
                <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 22 }}>
                  {friends.slice(0, 8).map((n, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ position: "relative", padding: 5, borderRadius: "50%", border: i === 0 && picked ? `5px solid ${C.accent}` : "5px solid transparent" }}>
                        <Avatar name={n} size={104} hue={(i * 53 + 330) % 360} />
                        {i === 0 && picked && (
                          <div style={{ position: "absolute", right: -4, bottom: -4, width: 44, height: 44, borderRadius: "50%", background: C.accent, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="check" size={26} color="#fff" stroke={3.4} />
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: C.ink }}>{n}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Tap f={f} at={p.tap_at} x={215} y={944} />
            {sf >= p.plane_at && !done && (
              <div style={{ position: "absolute", left: interpolate(pl, [0, 1], [200, 900]), top: interpolate(pl, [0, 0.5, 1], [900, 560, 180]), rotate: `${interpolate(pl, [0, 1], [10, -25])}deg` }}>
                <Icon name="plane" size={120} color={C.accent} stroke={2.2} fill="#fff" />
              </div>
            )}
            {done && p.reply && (
              <div style={{ position: "absolute", right: 70, top: 560, rotate: "4deg", scale: `${popIn(f, p.sent_at, 6)}`, background: C.ink, color: "#fff", borderRadius: "30px 30px 6px 30px", padding: "22px 30px", fontFamily: F.body, boxShadow: paperShadow }}>
                <div style={{ fontSize: 22, color: C.accentSoft, fontWeight: 700 }}>{friends[0]}</div>
                <div style={{ fontSize: 40, fontWeight: 800 }}>{p.reply}</div>
              </div>
            )}
          </>
        );
      }}
    </Stage>
  );
};
