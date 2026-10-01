#!/usr/bin/env python3
"""Automatic checks on a rendered reel.
usage: python3 qc.py <video.mp4> [out_dir]
Prints PASS/FAIL lines and writes a 3 fps contact sheet (qc_sheet.jpg) to look at."""
import json, re, subprocess, sys, os
V = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(V))
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", V], capture_output=True, text=True).stdout)
v = [s for s in pr["streams"] if s["codec_type"] == "video"][0]
a = [s for s in pr["streams"] if s["codec_type"] == "audio"]
dur = float(pr["format"]["duration"]); size = int(pr["format"]["size"]) / 1e6
ok = lambda c, m: print(("PASS " if c else "FAIL ") + m)
ok((v["width"], v["height"]) == (1080, 1920), f"format 1080x1920 ({v['width']}x{v['height']})")
ok(v.get("color_primaries") == "bt709" and v.get("color_transfer") == "bt709", f"colour tagged BT.709 ({v.get('color_primaries')}/{v.get('color_transfer')}) - otherwise phones show it washed out")
ok(v.get("pix_fmt") == "yuv420p", f"pix_fmt yuv420p ({v.get('pix_fmt')})")
ok(len(a) == 1, "has audio")
o = subprocess.run(["ffmpeg", "-i", V, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]); tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)
ok(-17 <= I <= -13, f"loudness {I} LUFS (target -15 / -14 for Instagram & TikTok)")
if tp: ok(float(tp[-1]) <= -0.5, f"true peak {tp[-1]} dBFS")
ok(dur <= 90, f"duration {dur:.1f}s")
ok(size <= 30, f"file size {size:.1f} MB (<=30 MB uploads everywhere)")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", V, "-vf", "fps=3,scale=150:-1,tile=15x8", "-frames:v", "1", f"{OUT}/qc_sheet.jpg"])
print("contact sheet:", f"{OUT}/qc_sheet.jpg")
