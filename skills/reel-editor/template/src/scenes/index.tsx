import React from "react";
import { E } from "../edit";
import { KineticTitle, Steps, BarChart, Quote, ImageCard, Messages, IconGrid } from "./universal";
import { Checklist, BeforeAfter, Notifications, BigNumber, PhoneRecording, LottieScene } from "./generic";
import { ProfileFollow, ViewsStamps, Comments, ShareSheet } from "./social";

// Lottie files: put the JSON in src/data/lottie/ and register it here, e.g.
// import confetti from "../data/lottie/confetti.json";  const LOTTIE: Record<string, any> = { confetti };
const LOTTIE: Record<string, any> = {};

const REGISTRY: Record<string, React.FC<{ f: number; s: any; data?: any }>> = {
  // ---- universal: any topic ----
  "kinetic-title": KineticTitle,
  steps: Steps,
  checklist: Checklist,
  "before-after": BeforeAfter,
  "big-number": BigNumber,
  "bar-chart": BarChart,
  quote: Quote,
  "image-card": ImageCard,
  messages: Messages,
  notifications: Notifications,
  "icon-grid": IconGrid,
  "phone-recording": PhoneRecording,
  lottie: LottieScene,
  // ---- social-media pack: ONLY when the video is about social media itself ----
  "social-profile-follow": ProfileFollow,
  "social-views-stamps": ViewsStamps,
  "social-comments": Comments,
  "social-share-sheet": ShareSheet,
};

export const Scenes: React.FC<{ f: number }> = ({ f }) => (
  <>
    {E.scenes.map((s, i) => {
      const Comp = REGISTRY[s.type];
      if (!Comp) return null;
      return <Comp key={i} f={f} s={s} data={s.type === "lottie" ? LOTTIE[s.props.name] : undefined} />;
    })}
  </>
);
