# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Colours washed out / too white | iPhone HDR (HLG, BT.2020, Dolby Vision) decoded without tonemapping, or output not tagged BT.709 | build_base.py tonemaps automatically when probe.json says hdr=true; it needs ffmpeg with `zscale`. Render with `--color-space=bt709`. qc.py checks the tags. |
| Colours too orange/yellow | the original shot is like that (golden light) | do not "fix" globally; if the user complains, a gentle per-shot saturation −10% only. Always ask before grading. |
| Model download fails (HuggingFace 403) | sandbox blocks huggingface.co | setup.sh downloads from GitHub releases of k2-fsa/sherpa-onnx (silero_vad, parakeet). rembg models also come from GitHub. |
| Chrome download fails | sandbox | setup.sh looks for a local Chromium (Playwright `/opt/pw-browsers`) and writes `.browser.env`; `source` it before rendering. |
| Fonts look default (Times/Arial) | font file missing or wrong name | check `reel/public/fonts/{display,body,quote}.ttf`; verify the google path returns 200. |
| Variable display font too thin | weight not set | `typography.display.weight` (600–800) in brand.json. |
| Words in captions glued together | stroke too thick | keep gap 30px and stroke 9px (Captions.tsx). |
| Caption timing slightly early/late | ASR offset | analyze.py adds +0.08 s; adjust single words with word_fixes/add_words if needed. |
| Process killed during cutout/matte | out of memory with big models | use `isnet-general-use` (default), never `birefnet-*` on small machines. |
| File > 30 MB, chat refuses upload | high bitrate | re-encode with -crf 20 -maxrate 3900k (see SKILL.md). |
| Burned-in captions/overlays from a videomaker | cannot be removed | ask for the clean export; build cards around them only as last resort. |
| A sticker/pill hidden behind the phone | the phone banner uses zIndex | give overlays zIndex ≥ 20. |
