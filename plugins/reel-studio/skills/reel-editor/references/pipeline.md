# Pipeline – files and scripts

```
raw video ──analyze.py──► an/ (probe, cuts, speech, words, keep_draft, contact.jpg)
          ──(Claude writes keep.json)──► build_base.py ──► reel/public/base.mp4  (SDR BT.709, 30fps, 1080x1920, no audio)
                                                      ──► an/voice_raw.f32     (segments loudness-matched to -19 LUFS)
                                                      ──► reel/src/data/timeline.json
          ──(Claude writes edit.json)──► mix.py ──► reel/public/mix.wav (voice -15 LUFS + music ducked + SFX)
          ──► remotion render Reel ──► out/reel.mp4 ──► qc.py
          ──► candidates.py → user picks → cutout.py → remotion still Cover → out/cover.png
```

## keep.json
```json
{
  "video": "/abs/path/raw.mov",
  "segments": [
    {"kind": "hook", "s": 0.10, "e": 4.66},
    {"kind": "q", "n": 1, "s": 4.73, "e": 6.12},
    {"kind": "a", "n": 1, "s": 6.52, "e": 11.64},
    {"kind": "outro", "s": 40.1, "e": 44.0}
  ],
  "word_fixes": {"eh?": null, "mandarvi.": "mandarli."},
  "add_words": [{"text": "Crea", "s": 29.47, "e": 29.80}]
}
```
- times are SOURCE seconds; segments in playback order (you may reorder takes).
- kinds: `hook`, `q` (question/section title → dark panel), `a` (answer → card + explainer scene), `outro`, `talk` (plain talking, captions only).
- Several raw files? Concatenate first: `ffmpeg -f concat -safe 0 -i list.txt -c copy all.mov` (same camera settings) or run analyze on each and reference the merged file.

## timeline.json (generated)
`segs[]` with `from_`/`dur` in output frames, `words[]` with output seconds and their segment index. Never edit by hand: re-run build_base.py.

## Typical timings (2 vCPU)
setup first run 3 min · analyze 1 min per minute of video · build_base 2 min · matte 1 s/frame · render 5 min for 35 s.

## Remotion project layout
```
reel/src/
  data/brand.json  data/timeline.json  data/edit.json  data/lottie/*.json
  theme.ts  (colours C.*, fonts F.* from brand.json)     ui.tsx (Title, Pill, Label, NumCircle, Icon, Avatar)
  Main.tsx  (video framing, question panels, cards, text-behind, end card)
  Captions.tsx   Cover.tsx
  scenes/kit.tsx (Stage, Paper, Headline, Tap, Phone)  scenes/social.tsx  scenes/generic.tsx  scenes/index.tsx (registry)
```
To add a new scene type: write the component using `Stage` + `stepF` + `popIn` + colours from `C`, register it in `scenes/index.tsx`, and add its SFX in `scripts/mix.py` (section "events derived from edit.json").
