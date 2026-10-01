---
name: reel-qc
description: Quality control for a rendered branded reel before delivery - colour space, loudness, file size, safe zones, faces covered, caption sync, brand rules, cover crop. Use at the end of reel-editor, or when the user asks "controlla il video", "è pronto da pubblicare?", "check this reel".
---

# Reel QC

## 1. Automatic checks
```bash
python3 SKILL_DIR/scripts/qc.py <video.mp4>
```
(`SKILL_DIR` = base directory printed when this skill loaded.) Every line must be PASS. Fix FAILs before delivering (re-render / re-encode), never ship with a FAIL.

## 2. Look at the contact sheet (qc_sheet.jpg) and at 6–10 full-size stills
Check each item; fix and re-render if any fails:

- [ ] **Natural colours**: skin and whites look like the original phone video, not washed out / grey / white-ish. Compare one still with a frame of the raw file.
- [ ] **Faces never covered** by cards, captions or stickers.
- [ ] **Safe zones**: no important text in the top 110 px, bottom 320 px, right 120 px (UI of Instagram/TikTok).
- [ ] **Frame 0** shows the hook text (people decide in the first second).
- [ ] **Captions** in sync, no glued words, keywords on the accent block, hidden during question panels.
- [ ] **Brand rules**: only brand colours/fonts, one accent word per title, no two accents in the same frame.
- [ ] **Every answer starts on the person**, then the example scene.
- [ ] **No leftover silence**, no cut mid-word, no repeated takes, every cut the user asked for is done.
- [ ] **Audio**: every clip at the same level (listen to the transitions between clips), music never covers the voice, SFX not louder than the voice.
- [ ] **Content coherence**: the words never contradict the structure (no missing sections, no answer under the wrong question).
- [ ] **End card**: keyword identical in end card, caption and DM message.
- [ ] **Cover**: the person likes the frame (they chose it), title readable in the 3:4 grid crop (y 240–1680).

## 3. Report
Tell the user in 3–5 lines: duration, what was cut, what was added, anything they must do (prepare part 2, set the DM automation, choose music in-app).
