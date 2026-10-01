#!/usr/bin/env python3
"""Cut the raw video into the base clip + matched voice + timeline.

usage: python3 build_base.py <keep.json> <analysis_dir> <reel_dir>

keep.json:
{
  "video": "/path/raw.mov",
  "segments": [ {"kind": "hook|q|a|outro|...", "n": 1, "s": 0.10, "e": 4.66}, ... ],   # SOURCE seconds, in order
  "word_fixes": {"mandarvi.": "mandarli.", "eh?": null},                             # null = remove from captions
  "add_words": [ {"text": "Crea", "s": 29.47, "e": 29.80} ]                          # SOURCE seconds
}
Outputs:
  reel/public/base.mp4          colour-correct (HDR -> SDR BT.709 tonemap when needed), 30 fps, no audio
  <analysis_dir>/voice_raw.f32  48 kHz mono voice, every segment loudness-matched to the same level
  reel/src/data/timeline.json   segments on the output timeline + words remapped (used by Remotion & mix.py)
"""
import json, os, re, subprocess, sys
import numpy as np

KEEP, AN, REEL = sys.argv[1], sys.argv[2], sys.argv[3]
k = json.load(open(KEEP)); probe = json.load(open(f"{AN}/probe.json"))
SRC = k["video"]; FPS = 30; SR = 48000
TONEMAP = "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
SDR = "scale=in_range=tv:out_range=tv,format=yuv420p"

segs = []; t = 0
for g in k["segments"]:
    fs, fe = round(g["s"] * FPS), round(g["e"] * FPS)
    segs.append(dict(kind=g["kind"], n=g.get("n"), label=g.get("label"), s=fs / FPS, e=fe / FPS, from_=t, dur=fe - fs)); t += fe - fs
TOTAL = t

# ---------- video ----------
scale = f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={FPS}"
parts = "".join(f"[0:v]trim=start={g['s']}:end={g['e']},setpts=PTS-STARTPTS,{scale}[v{i}];" for i, g in enumerate(segs))
cat = "".join(f"[v{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=0[vc];[vc]{TONEMAP if probe['hdr'] else SDR}[vo]"
os.makedirs(f"{REEL}/public", exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", parts + cat, "-map", "[vo]", "-r", str(FPS),
                "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-g", "15", "-pix_fmt", "yuv420p",
                "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-an",
                f"{REEL}/public/base.mp4"], check=True)
print("base.mp4 ok", "(HDR tonemapped)" if probe["hdr"] else "(SDR)")

# ---------- voice, loudness matched per segment ----------
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.float32)
def lufs(x):
    x.astype(np.float32).tofile("/tmp/_l.f32")
    o = subprocess.run(["ffmpeg", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "/tmp/_l.f32", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    v = re.findall(r"I:\s+(-?[\d.]+) LUFS", o); return float(v[-1]) if v else -70.0
voice = np.zeros(int(TOTAL / FPS * SR) + SR, np.float32); fade = int(0.01 * SR)
for g in segs:
    x = a[int(g["s"] * SR):int(g["e"] * SR)].copy()
    L = lufs(x); gain_db = max(-12, min(14, -19 - L)) if L > -60 else 0
    x *= 10 ** (gain_db / 20); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    i = int(g["from_"] / FPS * SR); voice[i:i + len(x)] += x
    g["lufs_in"] = round(L, 1); g["gain_db"] = round(gain_db, 1)
voice.tofile(f"{AN}/voice_raw.f32")
print("loudness per segment:", [(g["kind"], g["n"], g["lufs_in"], g["gain_db"]) for g in segs])

# ---------- words -> output timeline ----------
words = json.load(open(f"{AN}/words.json"))
fixes = k.get("word_fixes", {})
src_words = [dict(w=w["w"], s=w["s"], e=w["e"]) for w in words] + [dict(w=x["text"], s=x["s"], e=x["e"]) for x in k.get("add_words", [])]
src_words.sort(key=lambda x: x["s"])
out = []
for w in src_words:
    txt = fixes.get(w["w"], w["w"]) if w["w"] in fixes else w["w"]
    if txt is None: continue
    for gi, g in enumerate(segs):
        if g["s"] - 0.05 <= w["s"] < g["e"]:
            s0 = max(w["s"], g["s"]); os_ = g["from_"] / FPS + (s0 - g["s"])
            oe = g["from_"] / FPS + (min(w["e"], g["e"]) - g["s"])
            out.append(dict(text=txt, start=round(os_, 3), end=round(max(oe, os_ + 0.12), 3), seg=gi)); break
os.makedirs(f"{REEL}/src/data", exist_ok=True)
json.dump(dict(fps=FPS, segs=segs, total_video_frames=TOTAL, words=out), open(f"{REEL}/src/data/timeline.json", "w"), ensure_ascii=False, indent=1)
print(f"timeline: {TOTAL} frames ({TOTAL / FPS:.1f}s), {len(out)} words")
for i, g in enumerate(segs):
    ws = " ".join(f"{x['text']}@{round(x['start'] * FPS)}" for x in out if x["seg"] == i)
    print(f"  seg {i} {g['kind']}{g['n'] or ''} frames {g['from_']}-{g['from_'] + g['dur']}: {ws}")
