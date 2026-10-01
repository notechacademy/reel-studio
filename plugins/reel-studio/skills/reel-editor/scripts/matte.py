#!/usr/bin/env python3
"""Person matte for the 'text behind the person' effect (only when the user asks for it).

usage: python3 matte.py <reel_dir> <from_frame> <to_frame> <out_subdir>
Reads reel/public/base.mp4 frames [from, to) and writes reel/public/<out_subdir>/000001.png ...
(RGBA: the person in full colour, background transparent). Remotion draws: video -> text -> these PNGs.
Works best with a static camera and a subject that separates from the background. ~1 s per frame on CPU.
"""
import os, subprocess, sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

REEL, A, B, SUB = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
out = f"{REEL}/public/{SUB}"; os.makedirs(out, exist_ok=True)
W, H = 1080, 1920
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{REEL}/public/base.mp4", "-vf", f"select='between(n\\,{A}\\,{B - 1})'", "-vsync", "0",
                      "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
sess = new_session(os.environ.get("REMBG_MODEL", "isnet-general-use"))
prev = None
for i, fr in enumerate(frames):
    m = np.array(remove(Image.fromarray(fr), session=sess, only_mask=True), dtype=np.float32)
    if prev is not None: m = 0.6 * m + 0.4 * prev   # temporal smoothing against flicker
    prev = m
    rgba = np.dstack([fr, m.clip(0, 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(f"{out}/{i + 1:06d}.png")
    if i % 10 == 0: print(f"matte {i + 1}/{len(frames)}")
print("done:", out)
