import React from "react";
import { Composition, Still } from "remotion";
import { Main } from "./Main";
import { Cover } from "./Cover";
import { TOTAL, FPS, W, H } from "./edit";
import "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Main} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Still id="Cover" component={Cover} width={W} height={H} />
  </>
);
