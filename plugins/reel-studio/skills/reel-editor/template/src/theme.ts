import { loadFont } from "@remotion/fonts";
import { staticFile, random, Easing, interpolate } from "remotion";
import brand from "./data/brand.json";

// ---------------------------------------------------------------------------
// Everything visual comes from data/brand.json (created by the brand-kit skill).
// Never hard-code a colour or a font in a component: use C.* and F.*.
// ---------------------------------------------------------------------------
export type Brand = typeof brand;
export const B = brand as Brand;

export const C = {
  bg: B.colors.background, // main light background (60%)
  surface: B.colors.surface, // cards on light bg / text on dark
  ink: B.colors.ink, // titles + text
  dark: B.colors.dark, // dark slides (30%)
  accent: B.colors.accent, // the ONE accent (10%)
  accentDark: B.colors.accent_dark, // small accent text on light bg
  accentSoft: B.colors.accent_soft, // glows, soft highlights
  muted: B.colors.muted, // notes, secondary text
  darkGlow: B.colors.dark_glow, // tint of the radial glow on dark slides
};

export const F = {
  display: "BrandDisplay",
  body: "BrandBody",
  quote: "BrandQuote",
};
export const UPPER = B.typography.display_uppercase ? "uppercase" : "none";

const fontFile = (f: string) => staticFile(`fonts/${f}`);
export const fontsReady = Promise.all([
  // variable display fonts: the face is declared at the brand weight, Chrome then renders that instance
  loadFont({ family: F.display, url: fontFile(B.typography.display.file), weight: String((B.typography.display as any).weight ?? 400) }),
  loadFont({ family: F.body, url: fontFile(B.typography.body.file), weight: B.typography.body.variable ? "100 900" : "400" }),
  ...((B.typography as any).body_bold?.file ? [loadFont({ family: F.body, url: fontFile((B.typography as any).body_bold.file), weight: "800" })] : []),
  loadFont({ family: F.quote, url: fontFile(B.typography.quote.file), style: "italic", weight: B.typography.quote.variable ? "400 900" : "400" }),
]);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

// ---------------- stop-motion helpers ----------------
// time is quantised to 10 fps and each "photo" gets a tiny random offset
export const STEP = 3;
export const stepF = (f: number) => Math.floor(f / STEP) * STEP;
export const jit = (seed: string, f: number, amt = 1) => {
  const k = Math.floor(f / STEP);
  return {
    x: (random(`${seed}x${k}`) - 0.5) * 6 * amt,
    y: (random(`${seed}y${k}`) - 0.5) * 6 * amt,
    r: (random(`${seed}r${k}`) - 0.5) * 1.6 * amt,
  };
};
export const popIn = (f: number, at: number, dur = 9, stepped = true) =>
  interpolate(stepped ? stepF(f) : f, [at, at + dur], [0, 1], { ...clamp, easing: backOut });

export const paperShadow = "10px 12px 0 rgba(20,20,20,0.16)";
export const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
