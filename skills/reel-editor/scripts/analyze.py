#!/usr/bin/env python3
"""Analyse a raw talking-head video.

usage: python3 analyze.py <video> <out_dir>

Writes into out_dir:
  probe.json      colour info (HDR or not), size, fps, duration
  cuts.json       scene cut times (s)
  speech.json     VAD speech segments [{s,e}]
  words.json      word-level transcript [{w,s,e}] (Parakeet TDT, 25 EU languages)
  keep_draft.json suggested keep ranges (speech, padded, clamped to shots) -> Claude reviews and labels them
  contact.jpg     1 fps contact sheet with time labels
"""
import json, os, subprocess, sys, wave
import numpy as np

VIDEO, OUT = sys.argv[1], sys.argv[2]
MODELS = os.environ.get("REEL_MODELS", os.path.expanduser("~/.reel-studio/models"))
os.makedirs(OUT, exist_ok=True)
run = lambda *a: subprocess.run(list(a), capture_output=True, text=True)

# ---------- probe ----------
pr = json.loads(run("ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", VIDEO).stdout)
v = [s for s in pr["streams"] if s["codec_type"] == "video"][0]
hdr = v.get("color_transfer") in ("arib-std-b67", "smpte2084") or v.get("color_primaries") == "bt2020"
num, den = map(int, v["r_frame_rate"].split("/"))
probe = dict(width=v["width"], height=v["height"], fps=num / den, duration=float(pr["format"]["duration"]),
             transfer=v.get("color_transfer"), primaries=v.get("color_primaries"), hdr=hdr, codec=v["codec_name"],
             rotation=v.get("side_data_list", [{}])[0].get("rotation", 0) if v.get("side_data_list") else 0)
json.dump(probe, open(f"{OUT}/probe.json", "w"), indent=1)
print("probe:", probe)

# ---------- scene cuts ----------
o = run("ffmpeg", "-i", VIDEO, "-vf", "scale=270:480,select='gt(scene,0.2)',showinfo", "-an", "-f", "null", "-").stderr
import re
cuts = sorted(set(round(float(x), 3) for x in re.findall(r"pts_time:([0-9.]+)", o)))
cuts = [c for i, c in enumerate(cuts) if i == 0 or c - cuts[i - 1] > 0.2]
json.dump(cuts, open(f"{OUT}/cuts.json", "w"))
print("cuts:", cuts)

# ---------- audio ----------
wav = f"{OUT}/audio16k.wav"
run("ffmpeg", "-v", "error", "-y", "-i", VIDEO, "-ac", "1", "-ar", "16000", wav)
w = wave.open(wav); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768

import sherpa_onnx
cfg = sherpa_onnx.VadModelConfig(); cfg.silero_vad.model = f"{MODELS}/silero_vad.onnx"
cfg.silero_vad.min_silence_duration = 0.12; cfg.silero_vad.min_speech_duration = 0.1; cfg.silero_vad.max_speech_duration = 8; cfg.sample_rate = 16000
vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=200)
ws = cfg.silero_vad.window_size; segs = []
for i in range(0, len(a), ws):
    vad.accept_waveform(a[i:i + ws])
    while not vad.empty(): segs.append((vad.front.start, len(vad.front.samples))); vad.pop()
vad.flush()
while not vad.empty(): segs.append((vad.front.start, len(vad.front.samples))); vad.pop()
speech = [dict(s=round(st / 16000, 3), e=round((st + n) / 16000, 3)) for st, n in segs]
json.dump(speech, open(f"{OUT}/speech.json", "w"))

# ---------- word-level transcript ----------
d = f"{MODELS}/parakeet/"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=d + "encoder.int8.onnx", decoder=d + "decoder.int8.onnx", joiner=d + "joiner.int8.onnx",
                                                    tokens=d + "tokens.txt", model_type="nemo_transducer", num_threads=os.cpu_count() or 2)
OFFSET = 0.08  # parakeet timestamps are ~1 frame early
words = []
for sg in speech:
    b = max(0, sg["s"] - 0.15); e = sg["e"] + 0.15
    st = rec.create_stream(); st.accept_waveform(16000, a[int(b * 16000):int(e * 16000)]); rec.decode_stream(st)
    r = st.result; cur = None
    print(f"[{sg['s']:.2f}-{sg['e']:.2f}] {r.text}")
    for tk, t in zip(r.tokens, r.timestamps):
        if tk.startswith("▁") or tk.startswith(" ") or cur is None:
            if cur: words.append(cur)
            cur = dict(w=tk.lstrip("▁ "), s=round(b + t + OFFSET, 3))
        else: cur["w"] += tk
    if cur: words.append(cur)
words = [x for x in words if x["w"]]
for i, x in enumerate(words):
    nxt = words[i + 1]["s"] if i + 1 < len(words) else x["s"] + 0.4
    x["e"] = round(min(nxt, x["s"] + 0.6), 3)
json.dump(words, open(f"{OUT}/words.json", "w"), ensure_ascii=False, indent=0)

# ---------- keep draft: speech padded 0.12/0.15 s, clamped inside shots, merged when gap < 0.35 s ----------
bounds = [0.0] + cuts + [probe["duration"]]
shots = list(zip(bounds[:-1], bounds[1:]))
keep = []
for sh0, sh1 in shots:
    inside = [x for x in speech if x["e"] > sh0 + 0.05 and x["s"] < sh1 - 0.05]
    if not inside: continue
    rng = []
    for x in inside:
        s0 = max(sh0 + 0.02, x["s"] - 0.12); e0 = min(sh1 - 0.02, x["e"] + 0.15)
        if rng and s0 - rng[-1][1] < 0.35: rng[-1][1] = e0
        else: rng.append([s0, e0])
    for s0, e0 in rng:
        txt = " ".join(wd["w"] for wd in words if s0 <= wd["s"] < e0)
        keep.append(dict(kind="?", n=None, s=round(s0, 3), e=round(e0, 3), text=txt))
json.dump(keep, open(f"{OUT}/keep_draft.json", "w"), ensure_ascii=False, indent=1)

# ---------- contact sheet ----------
cols = 10
run("ffmpeg", "-v", "error", "-y", "-i", VIDEO, "-vf",
    f"fps=1,scale=160:-1,drawtext=text='%{{pts\\:hms}}':x=4:y=4:fontcolor=red:fontsize=18,tile={cols}x{int(np.ceil(probe['duration'] / cols))}",
    "-frames:v", "1", f"{OUT}/contact.jpg")
print("\nKEEP DRAFT (label kind = hook | q | a | outro ... before build):")
for k in keep: print(f"  {k['s']:6.2f}-{k['e']:6.2f}  {k['text']}")
