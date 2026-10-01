#!/usr/bin/env python3
"""Cover cut-out: subject from one frame of base.mp4 with a white sticker outline.

usage: python3 cutout.py <reel_dir> <frame_number> [crop_left_px]
writes reel/public/cover_cut.png (RGBA). Pick a frame where the person SMILES and looks at the camera:
always show 3-4 candidate frames to the user first and let them choose (people are picky about their face).
"""
import subprocess, sys
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session

REEL, FR = sys.argv[1], int(sys.argv[2])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{REEL}/public/base.mp4", "-vf", f"select='eq(n\\,{FR})'", "-vsync", "0", "-frames:v", "1", "/tmp/_cov.png"], check=True)
im = remove(Image.open("/tmp/_cov.png").convert("RGB"), session=new_session("isnet-general-use")).convert("RGBA")
a = np.array(im); al = a[..., 3]; al[al < 40] = 0; a[..., 3] = al
im = Image.fromarray(a); bb = im.getbbox(); im = im.crop(bb)
P = 24; big = Image.new("RGBA", (im.size[0] + 2 * P, im.size[1] + P), (0, 0, 0, 0)); big.paste(im, (P, P))
m = big.split()[3].point(lambda v: 255 if v > 100 else 0).filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(1.5))
out = Image.new("RGBA", big.size, (0, 0, 0, 0)); out.paste(Image.new("RGBA", big.size, (255, 255, 255, 255)), (0, 0), m); out.alpha_composite(big)
out.save(f"{REEL}/public/cover_cut.png"); print("cover_cut.png", out.size)
