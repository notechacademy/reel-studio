---
name: reel-editor
description: Edits a raw vertical talking-head video into a high-end branded reel - cuts silences, fixes HDR colour, levels audio, word-by-word captions, question panels, cards, stop-motion explainer scenes, music, SFX, CTA end card and cover - all in the user's brand (brand.json). Use when the user uploads a video and says "montami questo video", "edita il reel", "taglia dove non parlo e metti le caption", "fammi un video come quelli di Reel Studio", "edit this reel", or asks for motion graphics on a talking video.
---

# Reel Editor

Turn a raw talking video into a reel at motion-designer level, for ANY topic and any brand. The code does the heavy lifting; your job is the editorial and visual decisions. Work in this order and never skip the checks.

**Read `references/mistakes-to-avoid.md` before starting.** Every rule in it comes from a real failed edit.

Be proactive: cut, structure, add cards, punch-ins, scenes, sounds and music on your own judgement. The user should receive a finished, designed reel, not a list of options.

`SKILL_DIR` = the base directory printed when this skill loaded. Scripts: `SKILL_DIR/scripts`. Remotion template: `SKILL_DIR/template`.

## 0. Can this session do it?

Run `command -v ffmpeg node python3`. Video editing needs a real shell (Cowork with a cloud/VM workspace, or Claude Code). If there is no shell or the video cannot be read as a file, stop and say so plainly: a plain chat cannot render video.

## 1. Inputs

- **brand.json** – look in the Project docs/uploads/connected folder (`brand*.json`). Missing → run the **brand-kit** skill first. Never improvise a palette.
- **The raw video** – best: no captions or overlays burned in (ask for the clean export if you see burned-in text: you cannot remove it).
- Optional: **screen recordings** (shown inside a phone), **Lottie JSON** animations, **music mp3** (licensed), **script**.
- What the user explicitly asked (cuts to remove, clips to drop, tone). Write these down; they override defaults.

## 2. Setup (≈3 min first time, seconds afterwards)

```bash
bash SKILL_DIR/scripts/setup.sh <work_dir> <brand.json>
source <work_dir>/reel/.browser.env 2>/dev/null   # before every remotion command
```

## 3. Analyse

```bash
python3 SKILL_DIR/scripts/analyze.py <video> <work_dir>/an
```
Read `an/probe.json` (HDR?), `an/contact.jpg` (look at it), the printed transcript and `an/keep_draft.json`.

**Content check before editing (mandatory):** read the transcript as a viewer. If the structure promises something the footage does not contain (e.g. "6 objectives" but only 4 are filmed, a question followed by the wrong answer, a referenced clip missing), STOP and ask the user: send the missing clip, or cut the video shorter. Never ship a reel whose words contradict each other.

## 4. Decide the cuts → keep.json

Start from keep_draft.json and write `<work_dir>/keep.json` (format in `references/pipeline.md`):
- Keep only speech. Remove silences, false starts, repeated takes, filler ("ehm", trailing "eh?"), and anything the user asked to remove (e.g. "the part where I flip the book pages until I speak").
- Never cut across a shot boundary inside a range (the draft already respects `an/cuts.json`).
- Label every range: `hook`, `q` (a **section opener** – a question, "Errore 1", "Step 2", a list item title – gets the dark panel), `a` (the explanation that follows), `outro`, or `talk` (plain talking). Give `n` to q/a pairs (1, 2, 3…). Videos without sections are fine: hook + talk + outro, with scenes and cards on the talk.
- `word_fixes` for transcription mistakes ("mandarvi." → "mandarli."), `null` to hide fillers from captions; `add_words` for a clipped first word.

```bash
python3 SKILL_DIR/scripts/build_base.py <work_dir>/keep.json <work_dir>/an <work_dir>/reel
```
It tonemaps HDR (iPhone HLG/Dolby Vision) to BT.709 – this is what keeps the natural colours – levels every segment to the same loudness, and prints every word with its OUTPUT frame number. Use those frame numbers for all timing below.

## 5. Plan the edit, show it, then build

Use the **explainer-scenes** skill to decide – on your own – where motion graphics are needed and which ones, and the **reel-copy** skill for every on-screen text. Show the plan in one compact table (segment → what appears on screen) and continue; wait for approval only if the user asked to approve first.

Write `<work_dir>/reel/src/data/edit.json` – schema and a complete example in `references/edit-schema.md`. Rules that make the difference:

- **Hook (first frame)**: a card is visible on frame 0 (settle animation, not fade-in). It flips to a second card on the second sentence.
- **Section openers (`q` segments)**: dark panel, the video shrinks into a framed window, progress bar `n/total`, label (`question_label`, e.g. "ERRORE {n} DI {total}", "STEP {n}") and the keyword on the accent block landing exactly on the spoken keyword frame (`kw_at`). `question_pre` = optional small line above ("VUOI PIÙ", "ERRORE", or "").
- **Explanations (`a` / `talk`)**: a slim card on top (from +4 frames until the scene starts) with ONE accent word; then the explainer scene covers the frame from the word where the example starts. The person must be on screen at the start of every section.
- **Cards never cover the face**: they sit at y≈118 and are ≤ 2 lines. If the face is high in frame, shorten the card or skip it.
- **Punch-ins**: one per answer on a key word (`punches`), plus the hook flip.
- **Captions**: list the brand/topic keywords that get the accent block. Captions are hidden in question panels.
- **End card**: from brand.json `cta` (format + keyword + promise). If the video was cut short, the chips show what is covered (✓) and what is locked (part 2).
- **Text behind the person**: ONLY when the user asks. Static shot, ≤ 2 s, one big word. Make the matte first: `python3 SKILL_DIR/scripts/matte.py <reel> <from> <to> matte_xx` (≈1 s/frame).
- **Screen recordings**: copy to `reel/public/rec/`, use scene type `phone-recording` with zooms and taps on the moments being explained. Screen recordings beat drawn mock-ups whenever the user has them.
- **Lottie / After Effects**: copy the JSON into `reel/src/data/lottie/`, import it in `src/scenes/index.tsx` LOTTIE map, use scene type `lottie`.
- **Music**: `music.file` = user's licensed mp3 in `reel/public/`; otherwise the synthesized original bed (no copyright). Never download music from TikTok/Instagram.

```bash
python3 SKILL_DIR/scripts/mix.py <work_dir>/reel <work_dir>/an      # voice -15 LUFS + ducked music + SFX on every event
cd <work_dir>/reel && npx tsc --noEmit
npx remotion render Reel out/frames --frames=<10-16 key frames> --image-format=jpeg
```
Look at the stills (tile them into one sheet). Fix overlaps, faces covered, text overflow, wrong timing. Only then render.

## 6. Render, check, deliver

```bash
npx remotion render Reel out/reel.mp4 --crf=17 --color-space=bt709
python3 SKILL_DIR/../reel-qc/scripts/qc.py out/reel.mp4
```
Run the **reel-qc** skill checklist. If the file is > 30 MB re-encode: `ffmpeg -i out/reel.mp4 -c:v libx264 -crf 20 -maxrate 3900k -bufsize 7800k -preset slow -c:a aac -b:a 160k -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart out/reel_small.mp4`.

**Cover**: run `python3 SKILL_DIR/scripts/candidates.py <reel> <6 frames where the person smiles at camera>`, show the sheet, let the USER pick (people are rightly picky about their face; never choose a mid-word grimace). Then `cutout.py <reel> <frame>` and `npx remotion still Cover out/cover.png`.

Deliver: reel, cover, caption (reel-copy). Say in 3–5 lines what was done and what the user must prepare (e.g. the "part 2" promised in the CTA).

## Feedback loop

Every correction the user gives is a rule: apply it to this video AND remember it for the next ones (save it next to brand.json as `brand-notes.md` if the session has a Project).

## References

- `references/pipeline.md` – file formats (keep.json, timeline.json), what each script does, timings.
- `references/edit-schema.md` – edit.json fields + full example.
- `references/troubleshooting.md` – washed-out colours, blocked downloads, fonts, render errors, memory.
- `references/shooting-guide.md` – what to tell the user so the raw footage edits well.
- `references/mistakes-to-avoid.md` – the non-negotiable rules.
