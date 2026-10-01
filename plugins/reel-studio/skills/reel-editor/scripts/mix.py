#!/usr/bin/env python3
"""Final audio: voice (cleaned, -15 LUFS) + music bed (ducked under voice) + SFX placed on every visual event.

usage: python3 mix.py <reel_dir> <analysis_dir>
Reads reel/src/data/timeline.json + edit.json, writes reel/public/mix.wav.
SFX are synthesized (no copyright). Music: edit.music.file (mp3/wav in reel/public) or an original synthesized bed.
"""
import json, subprocess, sys
import numpy as np

REEL, AN = sys.argv[1], sys.argv[2]
SR, FPS = 48000, 30
tl = json.load(open(f"{REEL}/src/data/timeline.json")); ed = json.load(open(f"{REEL}/src/data/edit.json"))
END_FROM = tl["total_video_frames"]; END_DUR = ed["end"]["dur"] if ed.get("end") else 0
TOT = (END_FROM + END_DUR) / FPS; N = int(TOT * SR)
rng = np.random.default_rng(7)
fr = lambda x: x / FPS

# ---------------- voice ----------------
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", f"{AN}/voice_raw.f32", "-af",
                "highpass=f=75,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=3.5:attack=4:release=90:makeup=2,loudnorm=I=-15:TP=-2:LRA=6",
                "-ar", str(SR), "-f", "f32le", "/tmp/_vn.f32"], check=True)
voice = np.zeros(N, np.float32); vn = np.fromfile("/tmp/_vn.f32", np.float32)[:N]; voice[:len(vn)] = vn

# ---------------- dsp helpers ----------------
def env_ar(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))
def hp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4); return np.fft.irfft(X, len(x))
def bp_sweep(noise, f0, f1, q=0.7):
    n = len(noise); hop, win = 256, 1024; out = np.zeros(n + win); w = np.hanning(win); f = np.fft.rfftfreq(win, 1 / SR)
    for st in range(0, max(1, n - win), hop):
        fc = f0 * (f1 / f0) ** (st / max(1, n - win)); X = np.fft.rfft(noise[st:st + win] * w)
        out[st:st + win] += np.fft.irfft(X * np.exp(-0.5 * (np.log2((f + 1) / fc) / q) ** 2)) * w
    return out[:n] / 1.5
norm = lambda x: x / (np.abs(x).max() + 1e-9)
def add(buf, t, s, g):
    i = int(t * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(s)); buf[max(0, i):j] += s[max(0, -i):j - i] * g
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- SFX library ----------------
def whoosh(d=0.4, f0=300, f1=4000): n = int(d * SR); return norm(bp_sweep(rng.standard_normal(n), f0, f1)) * np.hanning(n) ** 0.7
def pop(f0=950):
    n = int(0.09 * SR); t = np.arange(n) / SR; f = f0 * np.exp(-t * 18) + 300; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)
def click():
    n = int(0.025 * SR); t = np.arange(n) / SR; return (hp(rng.standard_normal(n), 2500) * 0.7 + np.sin(2 * np.pi * 1800 * t) * 0.4) * np.exp(-t * 260)
def thump():
    n = int(0.25 * SR); t = np.arange(n) / SR; f = 95 * np.exp(-t * 10) + 45; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)
def boom():
    n = int(1.2 * SR); t = np.arange(n) / SR; f = 70 * np.exp(-t * 4) + 36
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2) + norm(bp_sweep(rng.standard_normal(n), 500, 100)) * np.exp(-t * 6) * 0.5
def paper():
    n = int(0.18 * SR); t = np.arange(n) / SR; return norm(bp_sweep(rng.standard_normal(n), 2500, 900, 1.2)) * np.exp(-t * 22)
def stamp(): p = paper(); s = thump() * 0.9; s[:len(p)] += p * 0.5; return norm(s)
def ding(base=1318.5):
    n = int(1.3 * SR); t = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * base * k * t) * np.exp(-t * d) for k, a, d in [(1, .55, 3.5), (1.5, .3, 4.5), (2, .18, 6), (3, .07, 9)]) * np.minimum(1, t / 0.003)
def notif():
    a = ding(1568) * 0.6; b = ding(2093) * 0.6; o = np.zeros(len(a) + int(0.09 * SR)); o[:len(a)] += a; o[int(0.09 * SR):] += b; return o
def scribble():
    n = int(0.5 * SR); t = np.arange(n) / SR
    return norm(bp_sweep(rng.standard_normal(n), 3000, 4500, 0.5)) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * t))) * np.hanning(n)
def riser(d=0.6):
    n = int(d * SR); t = np.arange(n) / SR; return norm(bp_sweep(rng.standard_normal(n), 400, 6000, 0.5)) * (t / d) ** 2

# ---------------- events derived from edit.json ----------------
E = [(0, boom(), .55), (0, whoosh(0.3, 5000, 300), .35)]
for s in tl["segs"]:
    if s["kind"] == "q":
        E += [(fr(s["from_"]) - 0.12, whoosh(0.34, 300, 4200), .42), (fr(s["from_"] + s["dur"]) - 0.16, whoosh(0.26, 4000, 400), .32)]
for q in ed.get("questions", []): E += [(fr(q["kw_at"]), pop(900), .5), (fr(q["kw_at"]), thump(), .35)]
for c in ed.get("cards", []):
    E += [(fr(c["from"]), whoosh(0.2, 1500, 6000), .22)]
    if c.get("block_at") is not None: E += [(fr(c["block_at"]), thump(), .45)]
for p in ed.get("punches", []): E += [(fr(p), thump(), .4)]
for b in ed.get("behind", []): E += [(fr(b["from"]), whoosh(0.3, 300, 3000), .3)]
for sc in ed.get("scenes", []):
    a, p, t = sc["from"], sc["props"], sc["type"]
    E += [(fr(a), paper(), .45), (fr(a), click(), .5), (fr(a + 2), click(), .45), (fr(a + 4), click(), .4), (fr(a + 4), thump(), .3)]
    if t.startswith("social-"): t = t[7:]
    if t == "profile-follow":
        E += [(fr(p["tap_at"]), click(), .6), (fr(p["tap_at"]), pop(1200), .35)]
        end = p.get("banner_at", sc["to"])
        E += [(fr(k), click(), .12) for k in range(p["tap_at"] + 3, end, 6)]
        if p.get("banner_at"): E += [(fr(p["banner_at"]), notif(), .28)]
    elif t == "views-stamps":
        E += [(fr(x["at"] + 3), stamp(), .6) for x in p["stamps"]]
        if p.get("note"): E += [(fr(p["note"]["at"]), scribble(), .22)]
    elif t == "comments":
        E += [(fr(x), pop(800 + 90 * (i % 4)), .35) for i, x in enumerate(p["times"])]
    elif t == "share-sheet":
        if p.get("pov"): E += [(fr(p["pov"]["at"]), pop(900), .4)]
        E += [(fr(p["sheet_at"]), whoosh(0.25, 800, 5000), .3), (fr(p["tap_at"]), click(), .6), (fr(p["tap_at"]), pop(1300), .3),
              (fr(p["plane_at"]), whoosh(0.35, 1200, 7000), .35), (fr(p["sent_at"]), notif(), .25), (fr(p["sent_at"]), pop(1000), .35)]
    elif t == "checklist":
        E += [(fr(x["at"]), pop(1100), .4) for x in p["items"]] + [(fr(x["at"]), click(), .4) for x in p["items"]]
    elif t == "before-after":
        E += [(fr(p["after"]["at"]), stamp(), .5)]
    elif t == "notifications":
        E += [(fr(x["at"]), notif(), .22) for x in p["items"]]
    elif t == "big-number":
        st, en = p.get("count_from_at", a + 4), p.get("count_to_at", sc["to"] - 15)
        E += [(fr(k), click(), .12) for k in range(st, en, 4)] + [(fr(en), thump(), .45)]
    elif t == "kinetic-title":
        E += [(fr(w["at"]), thump(), .35) for w in p["words"]]
        if p.get("sub"): E += [(fr(p["sub"]["at"]), whoosh(0.2, 1500, 6000), .2)]
    elif t == "steps":
        E += [(fr(x["at"]), pop(900 + 120 * i), .45) for i, x in enumerate(p["steps"])]
    elif t == "bar-chart":
        E += [(fr(x["at"]), whoosh(0.35, 300, 2500), .25) for x in p["bars"]]
    elif t == "quote":
        E += [(fr(p.get("at", a + 6)), whoosh(0.5, 2000, 400), .2)]
    elif t == "image-card":
        if p.get("label"): E += [(fr(p.get("at", a + 12)), stamp(), .45)]
    elif t == "messages":
        E += [(fr(x["at"]), pop(1400 if x["from"] == "me" else 1000), .4) for x in p["messages"]]
    elif t == "icon-grid":
        E += [(fr(x["at"]), pop(800 + 150 * i), .45) for i, x in enumerate(p["items"])]
    elif t == "phone-recording":
        E += [(fr(x["at"]), click(), .55) for x in p.get("taps", [])] + [(fr(z["at"]), whoosh(0.2, 600, 3000), .18) for z in p.get("zooms", [])]
if END_DUR:
    E += [(fr(END_FROM) - 0.6, riser(0.6), .3), (fr(END_FROM) - 0.1, whoosh(0.3, 300, 5000), .45), (fr(END_FROM + 14), boom(), .45), (fr(END_FROM + 14), ding(), .3)]
sfx = np.zeros(N + SR * 2, np.float32)
for t, s, g in E: add(sfx, t, s.astype(np.float32), g)
sfx = sfx[:N]

# ---------------- music ----------------
mcfg = ed.get("music", {"enabled": True})
music = np.zeros(N, np.float32)
q_starts = [s["from_"] for s in tl["segs"] if s["kind"] == "q"]
DROP = fr(q_starts[0]) if q_starts else 2.0
if mcfg.get("enabled", True) and mcfg.get("file"):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{REEL}/public/{mcfg['file']}", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    m = np.frombuffer(raw, np.float32)
    reps = int(np.ceil(N / max(1, len(m)))); music = np.tile(m, reps)[:N].copy()
    music = music / (np.abs(music).max() + 1e-9) * 0.5
elif mcfg.get("enabled", True):
    BPM = mcfg.get("bpm", 112); beat = 60 / BPM; bar = 4 * beat
    mus = np.zeros(N + SR * 3, np.float32); drums = np.zeros_like(mus)
    def ep(freq, dur, vel=1.0):
        n = int(dur * SR); t = np.arange(n) / SR; idx = 1.8 * np.exp(-t * 5)
        return (np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * t)) + 0.25 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 3)) * env_ar(n, 0.004, 0.9) * vel
    def kick():
        n = int(0.35 * SR); t = np.arange(n) / SR; f = 48 + 110 * np.exp(-t * 32)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + 0.08 * rng.standard_normal(n) * np.exp(-t * 200)
    def clap():
        n = int(0.25 * SR); t = np.arange(n) / SR; return bp_sweep(rng.standard_normal(n), 1400, 1100, 0.9) * np.exp(-t * 22)
    def hat(): n = int(0.05 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n), 7000) * np.exp(-t * 70)
    CH = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57, 62]]; ROOT = [41, 45, 38, 34]
    K, CL, HT = kick(), clap(), hat()
    for b in range(int(np.ceil(TOT / bar)) + 1):
        t0 = b * bar; ch = CH[b % 4]; r = ROOT[b % 4]
        for off, vel in [(0, 0.9), (1.5 * beat, 0.6), (2.5 * beat, 0.7)]:
            for m in ch: add(mus, t0 + off, ep(mtof(m + 12), 1.6, vel / len(ch)), 0.9)
        for k8 in range(8):
            tt = t0 + k8 * beat / 2 + (0.035 if k8 % 2 else 0)
            if tt >= DROP - 0.05:
                n = int(beat / 2 * SR * 0.9); tb = np.arange(n) / SR
                add(mus, tt, (np.sin(2 * np.pi * mtof(r) * tb) + 0.3 * np.sin(2 * np.pi * mtof(r + 12) * tb)) * env_ar(n, 0.005, 0.25), 0.5 if k8 % 2 == 0 else 0.3)
            add(drums, tt, HT, 0.16 if k8 % 2 else 0.22)
        for k4 in range(4):
            tt = t0 + k4 * beat
            if tt >= DROP - 0.01:
                add(drums, tt, K, 0.9)
                if k4 in (1, 3): add(drums, tt, CL, 0.35)
    mus = lp(mus, 3800) * 0.55 + drums
    tt = np.arange(len(mus)) / SR; w = np.clip((tt - (DROP - 0.6)) / 0.6, 0, 1)
    music = (lp(mus, 700) * (1 - w) + mus * w)[:N]
if music.any():
    tt = np.arange(N) / SR; music *= np.clip((TOT - tt) / 0.5, 0, 1)
    ve = np.convolve(np.abs(voice), np.ones(int(0.05 * SR)) / int(0.05 * SR), "same"); ve = np.clip(ve / 0.05, 0, 1)
    sm = np.convolve(ve, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same")
    music *= (1 - 0.55 * sm)

mix = voice + music * mcfg.get("gain", 0.30) + sfx * 0.55
mix.astype(np.float32).tofile("/tmp/_mix.f32")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "/tmp/_mix.f32", "-af", "alimiter=limit=0.9:level=false",
                "-ac", "2", "-c:a", "pcm_s16le", f"{REEL}/public/mix.wav"], check=True)
print(f"mix.wav ok ({TOT:.1f}s, {len(E)} sfx events, music={'file' if mcfg.get('file') else ('synth' if mcfg.get('enabled', True) else 'off')})")
