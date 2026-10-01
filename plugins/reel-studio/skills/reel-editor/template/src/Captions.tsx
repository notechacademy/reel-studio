import React from "react";
import { interpolate } from "remotion";
import { C, F, clamp, backOut } from "./theme";
import { T, E, FPS, END_FROM } from "./edit";

// Word-by-word captions. Words appear when spoken; brand keywords sit on the accent block.
const KEY = new Set(E.captions.keywords.map((k) => k.toLowerCase()));
const clean = (s: string) => s.toLowerCase().replace(/[.,!?;:«»"“”]/g, "");

type Page = { words: { text: string; s: number; e: number }[]; s: number; e: number };
const buildPages = (): Page[] => {
  const pages: Page[] = [];
  let cur: Page | null = null;
  const ws = T.words.map((w) => ({ text: w.text.replace(/[.!;:]$/, ""), s: Math.round(w.start * FPS), e: Math.round(w.end * FPS), seg: w.seg }));
  ws.forEach((w, i) => {
    const prev = ws[i - 1];
    const chars = cur ? cur.words.map((x) => x.text).join(" ").length + w.text.length : 0;
    const brk = !cur || cur.words.length >= 3 || chars > 17 || (prev && (/[.?!,]$/.test(T.words[i - 1].text) || w.s - prev.e > 9 || prev.seg !== w.seg));
    if (brk) { cur = { words: [], s: w.s, e: w.e }; pages.push(cur); }
    cur!.words.push({ text: w.text, s: w.s, e: w.e }); cur!.e = w.e;
  });
  pages.forEach((p, i) => { const nx = pages[i + 1]; p.e = nx ? Math.min(nx.s, p.e + 8) : p.e + 8; });
  return pages;
};
const PAGES = buildPages();

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  if (f >= END_FROM) return null;
  const seg = T.segs.find((s) => f >= s.from_ && f < s.from_ + s.dur);
  if (E.captions.hide_in_questions && seg && seg.kind === "q") return null;
  const page = PAGES.find((p) => f >= p.s && f < p.e);
  if (!page) return null;
  const pin = interpolate(f - page.s, [0, 5], [0, 1], { ...clamp, easing: backOut });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: E.captions.top, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 30px", scale: `${0.82 + 0.18 * pin}` }}>
      {page.words.map((w, i) => {
        const on = f >= w.s && (f < w.e || i === page.words.length - 1);
        const block = KEY.has(clean(w.text)) && f >= w.s;
        return (
          <span key={i} style={{
            position: "relative", fontFamily: F.body, fontWeight: 850, fontSize: 76, lineHeight: 1.15, letterSpacing: -1,
            color: "#fff", WebkitTextStroke: block ? "0px" : "9px rgba(10,10,10,0.92)", paintOrder: "stroke fill",
            textShadow: "0 6px 22px rgba(0,0,0,0.35)", padding: block ? "0 14px" : 0, background: block ? C.accent : "transparent",
            borderRadius: 10, scale: on ? "1.06" : "1", display: "inline-block", opacity: f >= w.s - 1 ? 1 : 0,
          }}>{w.text}</span>
        );
      })}
    </div>
  );
};
