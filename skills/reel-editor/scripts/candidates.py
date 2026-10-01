#!/usr/bin/env python3
"""Sheet of numbered candidate frames (for choosing the cover / checking expressions).
usage: python3 candidates.py <reel_dir> <frame> <frame> ...   -> reel/out/candidates.jpg"""
import subprocess, sys, os
from PIL import Image, ImageDraw
REEL = sys.argv[1]; frs = [int(x) for x in sys.argv[2:]]; os.makedirs(f"{REEL}/out", exist_ok=True)
tiles = []
for f in frs:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{REEL}/public/base.mp4", "-vf", f"select='eq(n\\,{f})',scale=360:-1", "-vsync", "0", "-frames:v", "1", f"/tmp/_c{f}.jpg"], check=True)
    im = Image.open(f"/tmp/_c{f}.jpg"); ImageDraw.Draw(im).text((10, 10), str(f), fill="red"); tiles.append(im)
W = Image.new("RGB", (360 * len(tiles), tiles[0].size[1]))
for i, t in enumerate(tiles): W.paste(t, (i * 360, 0))
W.save(f"{REEL}/out/candidates.jpg"); print(f"{REEL}/out/candidates.jpg")
