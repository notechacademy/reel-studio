#!/usr/bin/env python3
"""Dominant colours of a logo/screenshot, or contrast check of a brand.json.
usage: python3 extract_palette.py <image>            -> top colours (hex, share)
       python3 extract_palette.py --check brand.json  -> WCAG contrast of the key pairs"""
import sys, json
def lum(h):
    h = h.lstrip("#"); r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True); return (la + 0.05) / (lb + 0.05)
if sys.argv[1] == "--check":
    c = json.load(open(sys.argv[2]))["colors"]
    for fg, bg, need, what in [("ink", "background", 7, "text on light bg"), ("#FFFFFF", "accent", 3, "white titles on accent block"),
                               ("accent_dark", "background", 4.5, "small accent text on light bg"), ("surface", "dark", 7, "text on dark slides"),
                               ("accent", "dark", 3, "accent on dark slides")]:
        a = c.get(fg, fg); b = c[bg]; r = ratio(a, b)
        print(("PASS" if r >= need else "FAIL"), f"{what}: {fg} on {bg} = {r:.1f}:1 (need {need})")
    sys.exit()
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGBA"); im.thumbnail((300, 300))
px = [p[:3] for p in im.getdata() if p[3] > 128]
q = Image.new("RGB", (len(px), 1)); q.putdata(px)
pal = q.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
counts = sorted(pal.getcolors(), reverse=True); P = pal.getpalette()
for n, i in counts:
    r, g, b = P[i * 3:i * 3 + 3]; print(f"#{r:02X}{g:02X}{b:02X}  {100 * n / len(px):.0f}%")
